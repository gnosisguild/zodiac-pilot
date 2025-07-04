import type { JsonRpcRequest } from '@/types'
import { invariant } from '@epic-web/invariant'
import { getCompanionAppUrl } from '@zodiac/env'
import { JsonRpcProvider } from 'ethers'
import EventEmitter from 'events'
import { customAlphabet } from 'nanoid'
import type { ChainId } from 'ser-kit'
import { getReadOnlyProvider } from './readOnlyProvider'

const slug = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789')

export class TenderlyProvider extends EventEmitter {
  private chainId: ChainId
  private forkProviderPromise: Promise<JsonRpcProvider> | undefined
  private blockNumber: number | undefined

  private tenderlyVnetApi: string
  private throttledIncreaseBlock: () => void

  vnetId: string | undefined
  publicRpcSlug: string | undefined

  constructor(chainId: ChainId) {
    super()
    this.chainId = chainId
    this.tenderlyVnetApi = `${getCompanionAppUrl()}/vnet`
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
      return await getReadOnlyProvider(this.chainId).send(
        request.method,
        request.params || [],
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
          e,
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

  async deleteFork() {
    await this.forkProviderPromise
    if (!this.vnetId) return

    this.vnetId = undefined
    this.publicRpcSlug = undefined
    this.forkProviderPromise = undefined
    this.blockNumber = undefined

    // We no longer delete forks/virtual testnets on Tenderly. That way we will be able to persist and share Pilot sessions in the future.
    // await fetch(`${this.tenderlyVnetApi}/${vnetId}`, {
    //   method: 'DELETE',
    // })
  }

  getTransactionLink(txHash: string) {
    if (!this.publicRpcSlug) return ''
    return `https://dashboard.tenderly.co/explorer/vnet/${this.publicRpcSlug}/tx/${txHash}`
  }

  private async createFork(
    chainId: number,
    blockNumber?: number,
  ): Promise<JsonRpcProvider> {
    const res = await fetch(this.tenderlyVnetApi, {
      method: 'POST',
      body: JSON.stringify({
        slug: slug(),
        display_name: 'Zodiac Pilot Test Flight',
        fork_config: {
          network_id: chainId,
          block_number: blockNumber,
        },
        virtual_network_config: {
          base_fee_per_gas: 0,
          chain_config: {
            chain_id: chainId,
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

    const adminRpcSlug = json.rpcs.find(
      (rpc: any) => rpc.name === 'Admin RPC',
    ).slug
    this.publicRpcSlug = json.rpcs.find(
      (rpc: any) => rpc.name === 'Public RPC',
    ).slug

    // The API now returns proxied URLs directly, so we can use the admin RPC as-is
    const provider = new JsonRpcProvider(rpcUrl(adminRpcSlug), this.chainId)
    this.emit('update', {
      rpcUrl: rpcUrl(this.publicRpcSlug),
      vnetId: this.vnetId,
    })

    return provider
  }

  private proxyTenderlyUrl(tenderlyUrl: string): string {
    // Convert https://virtual.mainnet.rpc.tenderly.co/abc123
    // to https://app.pilot.gnosisguild.org/vnet/rpc/virtual.mainnet.rpc.tenderly.co/abc123
    const url = new URL(tenderlyUrl)
    const hostAndPath = url.host + url.pathname
    return `https://app.pilot.gnosisguild.org/vnet/rpc/${hostAndPath}`
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

export const rpcUrl = (slug: string | undefined) => {
  invariant(slug, 'slug is required')
  return `https://app.pilot.gnosisguild.org/vnet/rpc/${slug}`
}
