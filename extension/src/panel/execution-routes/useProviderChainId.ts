import { useInjectedWallet, useWalletConnect } from '@/providers'
import { ExecutionRoute, ProviderType } from '@/types'

/** The chain ID the `provider` is currently connected to. */
export const useProviderChainId = (route: ExecutionRoute) => {
  const injectedWallet = useInjectedWallet()
  const walletConnect = useWalletConnect(route.id)

  switch (route.providerType) {
    case ProviderType.InjectedWallet:
      return injectedWallet.chainId
    case ProviderType.WalletConnect:
      return walletConnect?.chainId || null
  }
}
