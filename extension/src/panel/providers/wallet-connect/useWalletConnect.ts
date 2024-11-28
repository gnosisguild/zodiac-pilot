import { invariant } from '@epic-web/invariant'
import { useCallback, useState } from 'react'
import { ChainId } from 'ser-kit'
import { ConnectionProvider, ConnectionStatus } from '../connectTypes'
import { WalletConnectEthereumMultiProvider } from './WalletConnectEthereumMultiProvider'
import { useAccounts } from './useAccounts'
import { useChainId } from './useChainId'
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

  const connect = useCallback(async () => {
    invariant(provider != null, 'provider not initialized')

    setConnectionStatus('connecting')
    console.debug('Connecting WalletConnect...')

    const { promise, resolve } = Promise.withResolvers()

    provider.once('chainChanged', resolve)

    await provider.disconnect()
    await provider.connect()

    setConnectionStatus('connected')

    // at this point provider.chainId is generally 1.
    // we gotta wait for the chainChanged event which
    // will be emitted even if the final chainId continues to be 1
    await promise

    console.debug('WalletConnect connected!')

    return {
      chainId: provider.chainId as unknown as ChainId,
      accounts: provider.accounts,
    }
  }, [provider])

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
