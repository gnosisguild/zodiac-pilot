import { getChainId } from '@/chains'
import {
  getEip1193ReadOnlyProvider,
  useInjectedWallet,
  useWalletConnect,
} from '@/providers'
import { Eip1193Provider, ProviderType, ZodiacRoute } from '@/types'

export const useRouteProvider = (route: ZodiacRoute): Eip1193Provider => {
  const injectedWallet = useInjectedWallet()
  const walletConnect = useWalletConnect(route.id)

  switch (route.providerType) {
    case ProviderType.InjectedWallet:
      return injectedWallet.provider
    case ProviderType.WalletConnect:
      return (
        walletConnect?.provider ||
        getEip1193ReadOnlyProvider(getChainId(route.avatar))
      )
  }
}
