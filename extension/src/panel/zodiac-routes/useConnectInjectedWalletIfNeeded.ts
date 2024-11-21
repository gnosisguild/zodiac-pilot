import { useInjectedWallet } from '@/providers'
import { ProviderType, ZodiacRoute } from '@/types'
import { useEffect } from 'react'

export const useConnectInjectedWalletIfNeeded = (route: ZodiacRoute) => {
  const { chainId, connect, connectionStatus } = useInjectedWallet()

  const mustConnectInjectedWallet =
    route.providerType === ProviderType.InjectedWallet &&
    !chainId &&
    connectionStatus === 'disconnected'

  // only use computed properties in here
  // otherwise, the effect will synchronize too often and
  // re-trigger the connection which leads to an infinite loop
  useEffect(() => {
    if (mustConnectInjectedWallet) {
      connect()
    }
  }, [connect, mustConnectInjectedWallet])
}
