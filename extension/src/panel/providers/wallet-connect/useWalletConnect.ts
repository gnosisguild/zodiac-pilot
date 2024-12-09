import { invariant } from '@epic-web/invariant'
import { useCallback, useState } from 'react'
import type { ConnectionProvider, ConnectionStatus } from '../connectTypes'
import { WalletConnectEthereumMultiProvider } from './WalletConnectEthereumMultiProvider'
import { useAccounts } from './useAccounts'
import { useChainId } from './useChainId'
import { useConnect } from './useConnect'
import { useConnected } from './useConnected'
import { useWalletConnectProvider } from './useWalletConnectProvider'

export type WalletConnectResult = ConnectionProvider & {
  provider: WalletConnectEthereumMultiProvider | null
  disconnect: () => void
}

export const useWalletConnect = (routeId: string): WalletConnectResult => {
  const provider = useWalletConnectProvider(routeId)
  const connected = useConnected(provider)
  const accounts = useAccounts(provider)
  const chainId = useChainId(provider)
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>('disconnected')

  const connect = useConnect(provider, {
    onBeforeConnect() {
      setConnectionStatus('connecting')
    },
    onConnect() {
      setConnectionStatus('connected')
    },
    onError() {
      setConnectionStatus('error')
    },
  })

  const disconnect = useCallback(async () => {
    invariant(provider != null, 'provider not initialized')

    await provider.disconnect()

    setConnectionStatus('disconnected')

    console.debug('WalletConnect disconnected!')
  }, [provider])

  return {
    provider,
    ready: connected,
    connect,
    disconnect,
    connectionStatus,
    accounts,
    chainId,
  }
}
