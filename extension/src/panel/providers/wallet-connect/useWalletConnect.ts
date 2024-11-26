import { invariant } from '@epic-web/invariant'
import { useCallback } from 'react'
import { WalletConnectEthereumMultiProvider } from './WalletConnectEthereumMultiProvider'
import { useAccounts } from './useAccounts'
import { useChainId } from './useChainId'
import { useConnected } from './useConnected'
import { useWalletConnectProvider } from './useWalletConnectProvider'

export interface WalletConnectResult {
  provider: WalletConnectEthereumMultiProvider | null
  ready: boolean
  connect(): Promise<{ chainId: number; accounts: string[] }>
  disconnect(): void
  accounts: string[]
  chainId?: number
}

export const useWalletConnect = (routeId: string): WalletConnectResult => {
  const provider = useWalletConnectProvider(routeId)
  const connected = useConnected(provider)
  const accounts = useAccounts(provider)
  const chainId = useChainId(provider)

  const connect = useCallback(async () => {
    invariant(provider != null, 'provider not initialized')

    console.debug('Connecting WalletConnect...')

    const { promise, resolve } = Promise.withResolvers()

    provider.once('chainChanged', resolve)

    await provider.disconnect()
    await provider.connect()

    // at this point provider.chainId is generally 1.
    // we gotta wait for the chainChanged event which
    // will be emitted even if the final chainId continues to be 1
    await promise

    console.debug('WalletConnect connected!')

    return {
      chainId: provider.chainId,
      accounts: provider.accounts,
    }
  }, [provider])

  const disconnect = useCallback(async () => {
    invariant(provider != null, 'provider not initialized')

    await provider.disconnect()

    console.debug('WalletConnect disconnected!')
  }, [provider])

  return {
    provider,
    ready: connected,
    connect,
    disconnect,
    accounts,
    chainId,
  }
}
