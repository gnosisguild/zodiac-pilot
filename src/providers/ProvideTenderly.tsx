import EventEmitter from 'events'

import { JsonRpcProvider } from '@ethersproject/providers'
import WalletConnectProvider from '@walletconnect/ethereum-provider'
import React, { useContext, useEffect, useState } from 'react'

import { useConnection } from '../settings/connectionHooks'
import { useBeforeUnload } from '../utils'

const TENDERLY_FORK_API = `https://api.tenderly.co/api/v1/account/${process.env.TENDERLY_USER}/project/${process.env.TENDERLY_PROJECT}/fork`
const headers: HeadersInit = new Headers()
headers.set('X-Access-Key', process.env.TENDERLY_ACCESS_KEY || '')

const TenderlyContext = React.createContext<TenderlyProvider | null>(null)

export const useTenderlyProvider = (): TenderlyProvider => {
  const context = useContext(TenderlyContext)
  if (!context) {
    throw new Error('must be wrapped by <ProvideTenderly>')
  }
  return context
}

const ProvideTenderly: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { provider: walletConnectProvider } = useConnection()
  const [tenderlyProvider, setTenderlyProvider] =
    useState<TenderlyProvider | null>(null)

  useEffect(() => {
    const tenderlyProvider = new TenderlyProvider(walletConnectProvider)
    setTenderlyProvider(tenderlyProvider)

    return () => {
      tenderlyProvider.deleteFork()
    }
  }, [walletConnectProvider])

  // delete fork when closing browser tab (the effect teardown won't be executed in that case)
  useBeforeUnload(() => {
    if (tenderlyProvider) tenderlyProvider.deleteFork()
  })

  return (
    <TenderlyContext.Provider value={tenderlyProvider}>
      {tenderlyProvider && children}
    </TenderlyContext.Provider>
  )
}

export default ProvideTenderly

interface JsonRpcRequest {
  method: string
  params?: Array<any>
}
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
  status: true
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
    logsBloom: string
    status: string
    type: string
  }
  parent_id: string
  created_at: string
  timestamp: string
}

export class TenderlyProvider extends EventEmitter {
  private walletConnectProvider: WalletConnectProvider
  private forkProviderPromise: Promise<JsonRpcProvider> | undefined

  private forkId: string | undefined
  private transactionIds: Map<string, string> = new Map()
  private transactionInfo: Map<string, Promise<TenderlyTransactionInfo>> =
    new Map()
  private blockNumber: number | undefined

  constructor(walletConnectProvider: WalletConnectProvider) {
    super()
    this.walletConnectProvider = walletConnectProvider
  }

  async request(request: JsonRpcRequest): Promise<any> {
    if (request.method === 'eth_chainId') {
      // WalletConnect seems to return a number even though it must be a string value, we patch this bug here
      return `0x${this.walletConnectProvider.chainId.toString(16)}`
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
      this.forkProviderPromise = this.createFork(
        this.walletConnectProvider.chainId
      )
    } else if (!this.forkProviderPromise) {
      // We have not spawned a fork currently, so we can just use the walletConnectProvider to get the latest on-chain state
      return await this.walletConnectProvider.request(request)
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

      // advance one extra block to account for apps waiting on the transaction's inclusion in the next block
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

  async fork(networkId: number, blockNumber?: number) {
    this.deleteFork()
    this.forkProviderPromise = this.createFork(networkId, blockNumber)
    return await this.forkProviderPromise
  }

  async deleteFork() {
    await this.forkProviderPromise
    if (!this.forkId) return

    const forkId = this.forkId
    this.forkId = undefined
    this.forkProviderPromise = undefined
    this.blockNumber = undefined
    await fetch(`${TENDERLY_FORK_API}/${forkId}`, {
      headers,
      method: 'DELETE',
      keepalive: true,
    })
  }

  private async createFork(
    networkId: number,
    blockNumber?: number
  ): Promise<JsonRpcProvider> {
    const res = await fetch(`${TENDERLY_FORK_API}`, {
      headers,
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
    return new JsonRpcProvider(`https://rpc.tenderly.co/fork/${this.forkId}`)
  }

  private async fetchForkInfo() {
    await this.forkProviderPromise
    if (!this.forkId) throw new Error('No Tenderly fork available')

    const res = await fetch(`${TENDERLY_FORK_API}/${this.forkId}`, {
      headers,
    })
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
      `${TENDERLY_FORK_API}/${this.forkId}/transaction/${transactionId}`,
      {
        headers,
      }
    )
    const json = await res.json()
    return {
      ...json.fork_transaction,
      dashboardLink: `https://dashboard.tenderly.co/${process.env.TENDERLY_USER}/${process.env.TENDERLY_PROJECT}/fork/${this.forkId}/simulation/${transactionId}`,
    }
  }
}
