import EventEmitter from 'events'

import { JsonRpcProvider } from '@ethersproject/providers'
import React, { useContext, useEffect, useState } from 'react'

import { useConnection } from '../settings/connectionHooks'

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
    const tenderlyProvider = new TenderlyProvider(walletConnectProvider.chainId)
    setTenderlyProvider(tenderlyProvider)

    return () => {
      tenderlyProvider.deleteFork()
    }
  }, [walletConnectProvider.chainId])
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
  private providerPromise: Promise<JsonRpcProvider> | undefined
  private forkId: string | undefined

  private transactionIds: Map<string, string> = new Map()
  private transactionInfo: Map<string, Promise<TenderlyTransactionInfo>> =
    new Map()

  constructor(networkId: number, blockNumber?: number) {
    super()
    this.providerPromise = this.createFork(networkId, blockNumber)
  }

  async getTransactionInfo(
    transactionHash: string
  ): Promise<TenderlyTransactionInfo> {
    if (this.transactionInfo.has(transactionHash)) {
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
    this.providerPromise = this.createFork(networkId, blockNumber)
    return await this.providerPromise
  }

  async request(request: JsonRpcRequest): Promise<any> {
    const provider = await this.providerPromise
    if (!provider) throw new Error('No Tenderly fork available')

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

    const { global_head: transactionId } = await this.fetchForkInfo()
    this.transactionIds.set(result, transactionId)

    return result
  }

  async deleteFork() {
    await this.providerPromise
    if (!this.forkId) return

    const forkId = this.forkId
    this.forkId = undefined
    this.providerPromise = undefined
    await fetch(`${TENDERLY_FORK_API}/${forkId}`, {
      headers,
      method: 'DELETE',
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
    this.transactionIds.clear()
    return new JsonRpcProvider(`https://rpc.tenderly.co/fork/${this.forkId}`)
  }

  private async fetchForkInfo() {
    await this.providerPromise
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
