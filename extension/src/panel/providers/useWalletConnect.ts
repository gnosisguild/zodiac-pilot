import { RPC } from '@/chains'
import { invariant } from '@epic-web/invariant'
import { useCallback, useEffect, useState } from 'react'
import {
  WALLETCONNECT_PROJECT_ID,
  WalletConnectEthereumMultiProvider,
} from './WalletConnectEthereumMultiProvider'

// Global states for providers and event targets
const providers: Record<
  string,
  Promise<WalletConnectEthereumMultiProvider> | undefined
> = {}

export interface WalletConnectResult {
  provider: WalletConnectEthereumMultiProvider | null
  ready: boolean
  connect(): Promise<{ chainId: number; accounts: string[] }>
  disconnect(): void
  accounts: string[]
  chainId?: number
}

export const useWalletConnect = (routeId: string): WalletConnectResult => {
  const provider = useProvider(routeId)
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

const useProvider = (routeId: string) => {
  const [provider, setProvider] =
    useState<WalletConnectEthereumMultiProvider | null>(null)

  // effect to initialize the provider
  useEffect(() => {
    if (providers[routeId] == null) {
      providers[routeId] = WalletConnectEthereumMultiProvider.init({
        routeId,
        projectId: WALLETCONNECT_PROJECT_ID,
        showQrModal: true,
        chains: [] as any, // recommended by WalletConnect for multi-chain apps (but somehow their typings don't allow it)
        optionalChains: Object.keys(RPC).map((chainId) => Number(chainId)),
        rpcMap: RPC,
        metadata: {
          name: 'Zodiac Pilot',
          description: 'Simulate dApp interactions and record transactions',
          url: 'https://pilot.gnosisguild.org',
          icons: ['//pilot.gnosisguild.org/zodiac48.png'],
        },
      })
    }

    providers[routeId].then(setProvider)
  }, [routeId])

  // effect to subscribe to provider events
  useEffect(() => {
    if (provider == null) {
      return
    }

    // disable warning about too many listeners
    provider.events.setMaxListeners(0)
  }, [provider])

  return provider
}

const useConnected = (provider: WalletConnectEthereumMultiProvider | null) => {
  const [connected, setConnected] = useState<boolean | undefined>(
    provider ? provider.connected : undefined
  )

  useEffect(() => {
    if (provider == null) {
      return
    }

    if (connected == null) {
      setConnected(provider.connected)
    }
  }, [connected, provider])

  useEffect(() => {
    if (provider == null) {
      return
    }

    const handleConnectionUpdate = () => {
      setConnected(provider.connected)
    }

    provider.on('connect', handleConnectionUpdate)
    provider.on('disconnect', handleConnectionUpdate)

    const handleAccountsChanged = () => {
      setConnected(provider.connected && provider.accounts.length > 0)
    }

    provider.on('accountsChanged', handleAccountsChanged)

    return () => {
      provider.off('connect', handleConnectionUpdate)
      provider.off('disconnect', handleConnectionUpdate)
      provider.off('accountsChanged', handleAccountsChanged)
    }
  }, [provider])

  return connected === true
}

const useAccounts = (provider: WalletConnectEthereumMultiProvider | null) => {
  const [accounts, setAccounts] = useState<string[] | undefined>(
    provider ? provider.accounts : undefined
  )

  useEffect(() => {
    if (provider == null) {
      return
    }

    if (accounts == null) {
      setAccounts(provider.accounts)
    }
  }, [accounts, provider])

  useEffect(() => {
    if (provider == null) {
      return
    }

    const handleAccountsChanged = () => {
      setAccounts(provider.accounts)
    }

    provider.events.on('accountsChanged', handleAccountsChanged)

    return () => {
      provider.events.removeListener('accountsChanged', handleAccountsChanged)
    }
  }, [provider])

  return accounts || []
}

const useChainId = (provider: WalletConnectEthereumMultiProvider | null) => {
  const [chainId, setChainId] = useState<number | undefined>()

  useEffect(() => {
    if (provider == null) {
      return
    }

    if (chainId == undefined) {
      setChainId(provider.chainId)
    }
  }, [chainId, provider])

  useEffect(() => {
    if (provider == null) {
      return
    }

    const handleChainChanged = () => {
      setChainId(provider.chainId)
    }
    provider.events.on('chainChanged', handleChainChanged)

    return () => {
      provider.events.removeListener('chainChanged', handleChainChanged)
    }
  }, [provider])

  return chainId
}
