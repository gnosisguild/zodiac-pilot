import { RPC } from '@/chains'
import { useEffect, useState } from 'react'
import {
  WALLETCONNECT_PROJECT_ID,
  WalletConnectEthereumMultiProvider,
} from './WalletConnectEthereumMultiProvider'

// Global states for providers and event targets
const providers: Record<
  string,
  Promise<WalletConnectEthereumMultiProvider> | undefined
> = {}

export const useWalletConnectProvider = (routeId: string) => {
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
