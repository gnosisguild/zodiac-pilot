import WalletConnectEthereumProvider from '@walletconnect/ethereum-provider'
import { useEffect, useState } from 'react'

interface Result {
  provider: WalletConnectEthereumProvider
  connected: boolean
}

class ProviderEventTarget extends EventTarget {
  constructor(provider: WalletConnectEthereumProvider) {
    super()

    // @ts-expect-error signer is a private property, but we didn't find another way
    provider.signer.on('connect', () => {
      this.dispatchEvent(new Event('connect'))
    })

    provider.on('disconnect', () => {
      this.dispatchEvent(new Event('disconnect'))
    })
  }
}

// Global states for providers and event targets
const providers: Record<string, WalletConnectEthereumProvider> = {}
// We need the indirection via an extra EventTarget to workaround MaxListenersExceededWarning emitted from WalletConnectEthereumProvider
const providerEventTargets: Record<string, ProviderEventTarget> = {}

const useWalletConnectProvider = (connectionId: string): Result => {
  if (!providers[connectionId]) {
    providers[connectionId] = new WalletConnectEthereumProvider({
      infuraId: 'b81b456501e34bed8a85a3c2ff8f4577',
      storageId: `walletconnect-${connectionId}`,
      rpc: {
        100: 'https://rpc.gnosischain.com/',
      },
    })
    providerEventTargets[connectionId] = new ProviderEventTarget(
      providers[connectionId]
    )
  }

  const provider = providers[connectionId]

  const [connected, setConnected] = useState(provider.connected)
  const providerEventTarget = providerEventTargets[connectionId]
  useEffect(() => {
    const handleConnection = () => {
      console.log(`WalletConnect connected: ${connectionId}`)
      setConnected(true)
    }
    providerEventTarget.addEventListener('connect', handleConnection)

    const handleDisconnection = () => {
      console.log(`WalletConnect disconnected: ${connectionId}`)
      setConnected(false)
    }
    providerEventTarget.addEventListener('disconnect', handleDisconnection)

    return () => {
      providerEventTarget.removeEventListener('connect', handleConnection)
      providerEventTarget.removeEventListener('disconnect', handleDisconnection)
    }
  }, [providerEventTarget, connectionId])

  return { provider, connected }
}

export default useWalletConnectProvider
