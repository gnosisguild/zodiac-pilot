import EventEmitter from 'events'

import WalletConnectEthereumProvider from '@walletconnect/ethereum-provider'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { RPC } from '../networks'

import { waitForMultisigExecution } from './safe'

// Wrap WalletConnectEthereumProvider to make it conform to EIP-1193.

// This resolves some incompatibilities in WalletConnectEthereumProvider:
//  - does not emit 'connect' events
//  - request 'eth_chainId' returns a number instead of a hex string
//  - registering too many event listeners causes MaxListenersExceededWarning error
//
// It also handles an idiosyncrasy of how the WalletConnect Safe app which return invalid transaction hashes before the transaction is signed by all owners.
class WalletConnectEip1193Provider extends EventEmitter {
  wcProvider: WalletConnectEthereumProvider

  constructor(connectionId: string) {
    super()

    this.wcProvider = new WalletConnectEthereumProvider({
      infuraId: 'b81b456501e34bed8a85a3c2ff8f4577',
      storageId: `walletconnect-${connectionId}`,
      rpc: RPC,
    })

    // @ts-expect-error signer is a private property, but we didn't find another way
    this.wcProvider.signer.on('connect', (ev: Event) => {
      console.log(`WalletConnect connected: ${connectionId}`, ev)
      this.emit('connect', ev)
    })

    this.wcProvider.on('disconnect', (ev: Event) => {
      console.log(`WalletConnect disconnected: ${connectionId}`, ev)
      this.emit('disconnect', ev)
    })
  }

  async request(request: {
    method: string
    params?: Array<any>
  }): Promise<any> {
    const { method } = request

    if (method === 'eth_chainId') {
      const result = await this.wcProvider.request(request)
      // WalletConnect seems to return a number even though it must be a string value
      return typeof result === 'number' ? `0x${result.toString(16)}` : result
    }

    if (method === 'eth_sendTransaction') {
      const safeTxHash: string = await this.wcProvider.request(request)
      const txHash = await waitForMultisigExecution(
        this.wcProvider,
        this.wcProvider.chainId,
        safeTxHash
      )
      return txHash
    }

    return this.wcProvider.request(request)
  }
}

// Global states for providers and event targets
const providers: Record<string, WalletConnectEip1193Provider> = {}

interface WalletConnectResult {
  provider: WalletConnectEip1193Provider
  connected: boolean
  connect(): Promise<{ chainId: number; accounts: string[] }>
  disconnect(): void
  accounts: string[]
  chainId: number | null
}

const useWalletConnect = (connectionId: string): WalletConnectResult => {
  if (!providers[connectionId]) {
    providers[connectionId] = new WalletConnectEip1193Provider(connectionId)
  }

  const provider = providers[connectionId]

  const [connected, setConnected] = useState(provider.wcProvider.connected)
  useEffect(() => {
    const handleConnection = () => {
      setConnected(true)
    }
    provider.on('connect', handleConnection)

    const handleDisconnection = () => {
      setConnected(false)
    }
    provider.on('disconnect', handleDisconnection)

    return () => {
      provider.removeListener('connect', handleConnection)
      provider.removeListener('disconnect', handleDisconnection)
    }
  }, [provider])

  const connect = useCallback(async () => {
    try {
      await provider.wcProvider.disconnect()
      await provider.wcProvider.enable()
    } catch (e) {
      // When the user dismisses the modal, the connectors stays in a pending state and the modal won't open again.
      // This fixes it:
      // @ts-expect-error signer is a private property, but we didn't find another way
      provider.wcProvider.signer.disconnect()
    }

    return {
      chainId: provider.wcProvider.chainId,
      accounts: provider.wcProvider.accounts,
    }
  }, [provider.wcProvider])

  const disconnect = useCallback(() => {
    provider.wcProvider.disconnect()
  }, [provider.wcProvider])

  const packed = useMemo(
    () => ({
      provider,
      connected,
      connect,
      disconnect,
      accounts: connected ? provider.wcProvider.accounts : [],
      chainId: connected ? provider.wcProvider.chainId : null,
    }),
    [provider, connected, connect, disconnect]
  )

  return packed
}

export default useWalletConnect
