import { useInjectedWallet, useWalletConnect } from '@/providers'
import { ProviderType, ZodiacRoute } from '@/types'

/** The chain ID the `provider` is currently connected to. */
export const useProviderChainId = (route: ZodiacRoute) => {
  const injectedWallet = useInjectedWallet()
  const walletConnect = useWalletConnect(route.id)

  switch (route.providerType) {
    case ProviderType.InjectedWallet:
      return injectedWallet.chainId
    case ProviderType.WalletConnect:
      return walletConnect?.chainId || null
  }
}
