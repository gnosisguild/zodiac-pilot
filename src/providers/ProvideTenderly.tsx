import EventEmitter from 'events'

import { JsonRpcProvider } from '@ethersproject/providers'
import React, { useContext, useEffect, useMemo, useState } from 'react'

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
    setTenderlyProvider(new TenderlyProvider(walletConnectProvider.chainId))
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

export class TenderlyProvider extends EventEmitter {
  private providerPromise: Promise<JsonRpcProvider> | undefined
  private forkId: string | undefined

  constructor(networkId: number, blockNumber?: number) {
    super()
    this.providerPromise = this.createFork(networkId, blockNumber)
  }

  async fork(networkId: number, blockNumber?: number) {
    this.deleteFork()
    this.providerPromise = this.createFork(networkId, blockNumber)
    return await this.providerPromise
  }

  async request(request: JsonRpcRequest): Promise<any> {
    const provider = await this.providerPromise
    if (!provider) throw new Error('No Tenderly fork available')

    return await provider.send(request.method, request.params || [])
  }

  private async createFork(
    networkId: number,
    blockNumber?: number
  ): Promise<JsonRpcProvider> {
    const res = await fetch(TENDERLY_FORK_API, {
      headers,
      method: 'POST',
      body: JSON.stringify({
        network_id: networkId.toString(),
        block_number: blockNumber,
      }),
    })

    const json = await res.json()
    this.forkId = json.simulation_fork.id
    return new JsonRpcProvider(`https://rpc.tenderly.co/fork/${this.forkId}`)
  }

  private async deleteFork() {
    if (!this.forkId) return

    const forkId = this.forkId
    this.forkId = undefined
    this.providerPromise = undefined
    await fetch(`${TENDERLY_FORK_API}/${forkId}`, { headers, method: 'DELETE' })
  }
}
