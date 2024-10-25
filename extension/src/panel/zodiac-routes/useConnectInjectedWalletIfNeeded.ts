import { useInjectedWallet } from '@/providers'
import { ProviderType, ZodiacRoute } from '@/types'
import { useEffect } from 'react'

export const useConnectInjectedWalletIfNeeded = (route: ZodiacRoute) => {
  const injectedWallet = useInjectedWallet()

  const routeUsesInjectedWallet =
    route.providerType === ProviderType.InjectedWallet
  const routeIsNotConnected =
    injectedWallet.chainId == null || !injectedWallet.connected

  const { connect } = injectedWallet

  // only use computed properties in here
  // otherwise, the effect will synchronize too often and
  // re-trigger the connection which leads to an infinite loop
  useEffect(() => {
    if (routeUsesInjectedWallet && routeIsNotConnected) {
      connect()
    }
  }, [connect, routeIsNotConnected, routeUsesInjectedWallet])
}
