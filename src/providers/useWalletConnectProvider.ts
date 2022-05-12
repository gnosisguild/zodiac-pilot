import WalletConnectEthereumProvider from '@walletconnect/ethereum-provider'
import { useEffect, useState } from 'react'

interface Result {
  provider: WalletConnectEthereumProvider
  connected: boolean
}

const providers: Record<string, WalletConnectEthereumProvider> = {}

const useWalletConnectProvider = (connectionId: string): Result => {
  if (!providers[connectionId]) {
    providers[connectionId] = new WalletConnectEthereumProvider({
      infuraId: 'b81b456501e34bed8a85a3c2ff8f4577',
      storageId: `walletconnect-${connectionId}`,
      rpc: {
        100: 'https://rpc.gnosischain.com/',
      },
    })
  }
  const provider = providers[connectionId]

  const [connected, setConnected] = useState(provider.connected)
  useEffect(() => {
    const handleConnection = () => {
      console.log(`WalletConnect connected: ${connectionId}`)
      setConnected(true)
    }
    // @ts-expect-error signer is a private property, but we didn't find another way
    provider.signer.on('connect', handleConnection)

    const handleDisconnection = () => {
      console.log(`WalletConnect disconnected: ${connectionId}`)
      setConnected(false)
    }
    provider.on('disconnect', handleDisconnection)

    return () => {
      // @ts-expect-error signer is a private property, but we didn't find another way
      provider.signer.off('connect', handleConnection)
      provider.off('disconnect', handleDisconnection)
    }
  }, [provider, connectionId])

  return { provider, connected }
}

export default useWalletConnectProvider
