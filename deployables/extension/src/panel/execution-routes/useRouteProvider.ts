import {
  getEip1193ReadOnlyProvider,
  useInjectedWallet,
  useWalletConnect,
} from '@/providers'
import { type ExecutionRoute, ProviderType } from '@/types'
import { getChainId } from '@zodiac/chains'

export const useRouteProvider = (route: ExecutionRoute) => {
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
