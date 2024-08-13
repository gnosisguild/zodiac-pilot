import EventEmitter from 'events'

import React, { useContext, useEffect, useMemo } from 'react'
import { customAlphabet } from 'nanoid'

import { useRoute } from '../routes'
import { JsonRpcRequest } from '../types'
import { useBeforeUnload } from '../utils'
import { initSafeProtocolKit, safeInterface } from '../integrations/safe'
import { getReadOnlyProvider } from './readOnlyProvider'
import { ChainId } from 'ser-kit'
import { asLegacyConnection } from '../routes/legacyConnectionMigrations'
import { JsonRpcProvider } from 'ethers'

const slug = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789')

const TenderlyContext = React.createContext<TenderlyProvider | null>(null)

export const useTenderlyProvider = (): TenderlyProvider => {
  const value = useContext(TenderlyContext)
  if (!value) throw new Error('must be wrapped in <ProvideTenderly>')
  return value
}

const ProvideTenderly: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { chainId, route } = useRoute()
  const { avatarAddress, moduleAddress, pilotAddress } =
    asLegacyConnection(route)

  const tenderlyProvider = useMemo(() => {
    return new TenderlyProvider(chainId)
  }, [chainId])

  // whenever anything changes in the connection settings, we delete the current fork and start afresh
  useEffect(() => {
    prepareSafeForSimulation(
      { chainId, avatarAddress, moduleAddress, pilotAddress },
      tenderlyProvider
    )

    return () => {
      tenderlyProvider.deleteFork()
    }
  }, [tenderlyProvider, chainId, avatarAddress, moduleAddress, pilotAddress])

  // delete fork when closing browser tab (the effect teardown won't be executed in that case)
  useBeforeUnload(() => {
    if (tenderlyProvider) tenderlyProvider.deleteFork()
  })

  if (!tenderlyProvider) return null

  return (
    <TenderlyContext.Provider value={tenderlyProvider}>
      {children}
    </TenderlyContext.Provider>
  )
}

export default ProvideTenderly

async function prepareSafeForSimulation(
  {
    chainId,
    avatarAddress,
    moduleAddress,
    pilotAddress,
  }: {
    chainId: ChainId
    avatarAddress: string
    moduleAddress?: string
    pilotAddress?: string
  },
  tenderlyProvider: TenderlyProvider
) {
  const safe = await initSafeProtocolKit(chainId, avatarAddress)

  // If we simulate as a Safe owner, we might have to override the owners & threshold of the Safe to allow single signature transactions
  if (!moduleAddress) {
    const [owners, threshold] = await Promise.all([
      safe.getOwners(),
      safe.getThreshold(),
    ])

    // default to first owner if no pilot address is provided
    if (!pilotAddress) pilotAddress = owners[0]

    const pilotIsOwner = owners.some(
      (owner) => owner.toLowerCase() === pilotAddress!.toLowerCase()
    )

    if (!pilotIsOwner) {
      // the pilot account is not an owner, so we need to make it one and set the threshold to 1 at the same time
      await tenderlyProvider.request({
        method: 'eth_sendTransaction',
        params: [
          {
            to: avatarAddress,
            data: safeInterface.encodeFunctionData('addOwnerWithThreshold', [
              pilotAddress,
              1,
            ]),
            from: avatarAddress,
          },
        ],
      })
    } else if (threshold > 1) {
      // doesn't allow to execute with single signature, so we need to override the threshold
      await tenderlyProvider.request({
        method: 'eth_sendTransaction',
        params: [
          {
            to: avatarAddress,
            data: safeInterface.encodeFunctionData('changeThreshold', [1]),
            from: avatarAddress,
          },
        ],
      })
    }
  }
}

export class TenderlyProvider extends EventEmitter {
  private chainId: number
  private forkProviderPromise: Promise<JsonRpcProvider> | undefined

  private vnetId: string | undefined
  private publicRpcSlug: string | undefined
  private blockNumber: number | undefined

  private tenderlyVnetApi: string
  private throttledIncreaseBlock: () => void

  constructor(chainId: ChainId) {
    super()
    this.chainId = chainId
    this.tenderlyVnetApi = 'https://vnet-api.pilot.gnosisguild.org'
    this.throttledIncreaseBlock = throttle(this.increaseBlock, 1000)
  }

  async request(request: JsonRpcRequest): Promise<any> {
    if (request.method === 'eth_chainId') {
      // WalletConnect seems to return a number even though it must be a string value, we patch this bug here
      return `0x${this.chainId.toString(16)}`
    }

    if (request.method === 'eth_blockNumber' && this.blockNumber) {
      // Some apps (such as Curve) only let the user continue in a transaction flow after a certain number of blocks have been mined.
      // To simulate progress of time/blocks, we increase the block number when polled, throttled in intervals of 1 second.
      // We cache the block number to save some polling requests so we don't hit Tenderly's rate limits too quickly.
      this.throttledIncreaseBlock()
      return this.blockNumber
    }

    if (
      !this.forkProviderPromise &&
      (request.method === 'eth_sendTransaction' ||
        request.method === 'evm_snapshot' ||
        request.method === 'evm_revert')
    ) {
      // spawn a fork lazily when sending the first transaction
      this.forkProviderPromise = this.createFork(this.chainId)
    } else if (!this.forkProviderPromise) {
      // We have not spawned a fork currently, so we can just use the provider to get the latest on-chain state
      return await getReadOnlyProvider(this.chainId as ChainId).send(
        request.method,
        request.params || []
      )
    }

    const provider = await this.forkProviderPromise
    let result
    try {
      result = await provider.send(request.method, request.params || [])
    } catch (e) {
      if ((e as any).error?.code === -32603) {
        console.error(
          'Tenderly vnet RPC has an issue (probably due to rate limiting)',
          e
        )
        throw new Error('Error sending request to Tenderly')
      } else {
        throw e
      }
    }

    if (request.method === 'eth_sendTransaction') {
      if (this.blockNumber) this.blockNumber++
    }

    return result
  }

  async refork() {
    this.deleteFork()
    this.forkProviderPromise = this.createFork(this.chainId)
    return await this.forkProviderPromise
  }

  async deleteFork() {
    // notify the background script to stop intercepting JSON RPC requests
    window.postMessage({ type: 'stopSimulating', toBackground: true }, '*')

    await this.forkProviderPromise
    if (!this.vnetId) return

    this.vnetId = undefined
    this.publicRpcSlug = undefined
    this.forkProviderPromise = undefined
    this.blockNumber = undefined

    // We no longer delete forks/virtual testnets on Tenderly. That way we will be able to persist and share Pilot sessions in the future.
    // (Also Tenderly doesn't seem to offer a DELETE endpoint for virtual networks.)
    // await fetch(`${this.tenderlyVnetApi}/${vnetId}`, {
    //   method: 'DELETE',
    // })
  }

  getTransactionLink(txHash: string) {
    return `https://dashboard.tenderly.co/explorer/vnet/${this.publicRpcSlug}/tx/${txHash}`
  }

  private async createFork(
    networkId: number,
    blockNumber?: number
  ): Promise<JsonRpcProvider> {
    const res = await fetch(this.tenderlyVnetApi, {
      method: 'POST',
      body: JSON.stringify({
        slug: slug(),
        display_name: 'Zodiac Pilot Test Flight',
        fork_config: {
          network_id: networkId,
          block_number: blockNumber,
        },
        virtual_network_config: {
          base_fee_per_gas: 0,
          chain_config: {
            chain_id: networkId,
          },
        },
        sync_state_config: {
          enabled: true,
        },
        explorer_page_config: {
          enabled: true, // enable public explorer page
          verification_visibility: 'bytecode',
        },
      }),
    })

    const json = await res.json()

    this.vnetId = json.id
    this.blockNumber = json.fork_config.block_number

    const adminRpc = json.rpcs.find((rpc: any) => rpc.name === 'Admin RPC').url
    const publicRpc = json.rpcs.find(
      (rpc: any) => rpc.name === 'Public RPC'
    ).url
    this.publicRpcSlug = publicRpc.split('/').pop()

    // notify the background script to start intercepting JSON RPC requests
    // we use the public RPC for requests originating from apps
    window.postMessage(
      {
        type: 'startSimulating',
        toBackground: true,
        networkId,
        rpcUrl: publicRpc,
      },
      '*'
    )

    // for requests going directly to Tenderly provider we use the admin RPC so Pilot can fully control the fork
    return new JsonRpcProvider(adminRpc)
  }

  private increaseBlock = async () => {
    if (!this.forkProviderPromise || !this.blockNumber) return
    const provider = await this.forkProviderPromise
    await provider.send('evm_increaseBlocks', ['0x1'])
    this.blockNumber++
  }
}

function throttle(func: (...args: any[]) => void, timeout: number) {
  let ready = true
  return (...args: any[]) => {
    if (!ready) {
      return
    }

    ready = false
    func(...args)
    setTimeout(() => {
      ready = true
    }, timeout)
  }
}
