import EventEmitter from 'events'

import { JsonRpcProvider } from '@ethersproject/providers'
import React, { useContext, useEffect, useState } from 'react'

import { useConnection } from '../settings/connectionHooks'
import { Eip1193Provider, JsonRpcRequest } from '../types'
import { useBeforeUnload } from '../utils'
import { initSafeProtocolKit } from '../safe/kits'
import { safeInterface } from '../safe'

const TenderlyContext = React.createContext<TenderlyProvider | null>(null)

export const useTenderlyProvider = (): TenderlyProvider | null =>
  useContext(TenderlyContext)

const ProvideTenderly: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { provider, chainId, connection } = useConnection()

  const [tenderlyProvider, setTenderlyProvider] =
    useState<TenderlyProvider | null>(null)

  useEffect(() => {
    if (!chainId) return

    const tenderlyProvider = new TenderlyProvider(provider, chainId)
    setTenderlyProvider(tenderlyProvider)

    const canceled = false
    async function prepareSafeForSimulation() {
      const { avatarAddress, moduleAddress, pilotAddress } = connection
      const safe = await initSafeProtocolKit(provider, avatarAddress)

      // If we simulate as a Safe owner, we might have to override the owners & threshold of the Safe to allow single signature transactions
      if (!moduleAddress) {
        const [owners, threshold] = await Promise.all([
          safe.getOwners(),
          safe.getThreshold(),
        ])

        const pilotIsOwner = owners.some(
          (owner) => owner.toLowerCase() === pilotAddress.toLowerCase()
        )

        if (!pilotIsOwner) {
          // the pilot account is not an owner, so we need to make it one and set the threshold to 1 at the same time
          await tenderlyProvider.request({
            method: 'eth_sendTransaction',
            params: [
              {
                to: avatarAddress,
                data: safeInterface.encodeFunctionData(
                  'addOwnerWithThreshold',
                  [pilotAddress, 1]
                ),
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

      if (!canceled) return
    }

    prepareSafeForSimulation()

    return () => {
      tenderlyProvider.deleteFork()
    }
  }, [provider, chainId, connection])

  // delete fork when closing browser tab (the effect teardown won't be executed in that case)
  useBeforeUnload(() => {
    if (tenderlyProvider) tenderlyProvider.deleteFork()
  })

  return (
    <TenderlyContext.Provider value={tenderlyProvider}>
      {children}
    </TenderlyContext.Provider>
  )
}

export default ProvideTenderly

export interface TenderlyTransactionInfo {
  id: string
  project_id: string
  dashboardLink: string
  fork_id: string
  hash: string
  block_number: number
  gas: number
  queue_origin: string
  gas_price: string
  value: string
  status: boolean
  fork_height: number
  block_hash: string
  nonce: number
  receipt: {
    transactionHash: string
    transactionIndex: string
    blockHash: string
    blockNumber: string
    from: string
    to: string
    cumulativeGasUsed: string
    gasUsed: string
    effectiveGasPrice: string
    contractAddress: null
    logs: {
      logIndex: string
      address: string
      topics: string[]
      data: string
      blockHash: string
      blockNumber: string
      removed: boolean
      transactionHash: string
      transactionIndex: string
    }[]
    logsBloom: string
    status: string
    type: string
  }
  parent_id: string
  created_at: string
  timestamp: string
}

export class TenderlyProvider extends EventEmitter {
  private provider: Eip1193Provider
  private chainId: number
  private forkProviderPromise: Promise<JsonRpcProvider> | undefined

  private forkId: string | undefined
  private transactionIds: Map<string, string> = new Map()
  private transactionInfo: Map<string, Promise<TenderlyTransactionInfo>> =
    new Map()
  private blockNumber: number | undefined

  private tenderlyForkApi: string

  constructor(provider: Eip1193Provider, chainId: number) {
    super()
    this.provider = provider
    this.chainId = chainId
    this.tenderlyForkApi = 'https://fork-api.pilot.gnosisguild.org'
  }

  async request(request: JsonRpcRequest): Promise<any> {
    if (request.method === 'eth_chainId') {
      // WalletConnect seems to return a number even though it must be a string value, we patch this bug here
      return `0x${this.chainId.toString(16)}`
    }

    if (request.method === 'eth_blockNumber' && this.blockNumber) {
      // Save some polling requests so we don't hit Tenderly's rate limits too quickly
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
      return await this.provider.request(request)
    }

    const provider = await this.forkProviderPromise
    let result
    try {
      result = await provider.send(request.method, request.params || [])
    } catch (e) {
      if ((e as any).error?.code === -32603) {
        console.error(
          'Tenderly fork RPC has an issue (probably due to rate limiting)',
          e
        )
        throw new Error('Error sending request to Tenderly')
      } else {
        throw e
      }
    }

    if (request.method === 'eth_sendTransaction') {
      // when sending a transaction, we need retrieve that transaction's ID on Tenderly
      const { global_head: headTransactionId, block_number } =
        await this.fetchForkInfo()
      this.blockNumber = block_number
      this.transactionIds.set(result, headTransactionId) // result is the transaction hash

      // advance two extra blocks to account for apps waiting on the transaction's inclusion in the next block
      window.setTimeout(async () => {
        await provider.send('evm_increaseBlocks', ['0x2'])
        if (this.blockNumber) this.blockNumber += 2
      }, 1)
    }

    return result
  }

  async getTransactionInfo(
    transactionHash: string
  ): Promise<TenderlyTransactionInfo> {
    if (!this.transactionInfo.has(transactionHash)) {
      this.transactionInfo.set(
        transactionHash,
        this.fetchTransactionInfo(transactionHash)
      )
    }

    const transactionInfoPromise = this.transactionInfo.get(transactionHash)
    if (!transactionInfoPromise) throw new Error('invariant violation')

    return await transactionInfoPromise
  }

  async refork() {
    this.deleteFork()
    this.transactionInfo.clear()
    this.forkProviderPromise = this.createFork(this.chainId)
    return await this.forkProviderPromise
  }

  async deleteFork() {
    await this.forkProviderPromise
    if (!this.forkId) return

    // notify the background script to stop intercepting JSON RPC requests
    window.postMessage({ type: 'stopSimulating', toBackground: true }, '*')

    const forkId = this.forkId
    this.forkId = undefined
    this.forkProviderPromise = undefined
    this.blockNumber = undefined
    await fetch(`${this.tenderlyForkApi}/${forkId}`, {
      method: 'DELETE',
    })
  }

  private async createFork(
    networkId: number,
    blockNumber?: number
  ): Promise<JsonRpcProvider> {
    const res = await fetch(this.tenderlyForkApi, {
      method: 'POST',
      body: JSON.stringify({
        network_id: networkId.toString(),
        block_number: blockNumber,
      }),
    })

    const json = await res.json()
    this.forkId = json.simulation_fork.id
    this.blockNumber = json.simulation_fork.block_number
    this.transactionIds.clear()

    const rpcUrl = `https://rpc.tenderly.co/fork/${this.forkId}`

    // notify the background script to start intercepting JSON RPC requests
    window.postMessage(
      { type: 'startSimulating', toBackground: true, networkId, rpcUrl },
      '*'
    )

    return new JsonRpcProvider(rpcUrl)
  }

  private async fetchForkInfo() {
    await this.forkProviderPromise
    if (!this.forkId) throw new Error('No Tenderly fork available')

    const res = await fetch(`${this.tenderlyForkApi}/${this.forkId}`)
    const json = await res.json()
    return json.simulation_fork
  }

  private async fetchTransactionInfo(
    transactionHash: string
  ): Promise<TenderlyTransactionInfo> {
    if (!this.forkId) throw new Error('No Tenderly fork available')

    const transactionId = this.transactionIds.get(transactionHash)
    if (!transactionId) throw new Error('Transaction not found')

    const res = await fetch(
      `${this.tenderlyForkApi}/${this.forkId}/transaction/${transactionId}`
    )
    const json = await res.json()
    return {
      ...json.fork_transaction,
      dashboardLink: `https://dashboard.tenderly.co/public/gnosisguild/zodiac-pilot/fork-simulation/${transactionId}`,
    }
  }
}
