import { ETH_ZERO_ADDRESS, getChainId } from '@/chains'
import { useInjectedWallet } from '@/providers'
import { ProviderType, ZodiacRoute } from '@/types'
import { nanoid } from 'nanoid'
import { useEffect } from 'react'
import { useSelectedRouteId } from './SelectedRouteContext'
import { useZodiacRoutes } from './ZodiacRoutesContext'

export const INITIAL_DEFAULT_ROUTE: ZodiacRoute = {
  id: nanoid(),
  label: '',
  providerType: ProviderType.InjectedWallet,
  avatar: ETH_ZERO_ADDRESS,
  initiator: undefined,
  waypoints: undefined,
}

export const useZodiacRoute = (id?: string) => {
  const routes = useZodiacRoutes()
  const [selectedRouteId] = useSelectedRouteId()

  const routeId = id || selectedRouteId
  const route =
    (routeId && routes.find((c) => c.id === routeId)) ||
    routes[0] ||
    INITIAL_DEFAULT_ROUTE

  const chainId = getChainId(route.avatar)

  const injectedWallet = useInjectedWallet()

  const mustConnectInjectedWallet =
    route.providerType === ProviderType.InjectedWallet &&
    !injectedWallet.chainId &&
    injectedWallet.connected

  const connectInjectedWallet = injectedWallet.connect

  useEffect(() => {
    if (mustConnectInjectedWallet) {
      connectInjectedWallet()
    }
  }, [mustConnectInjectedWallet, connectInjectedWallet])

  return {
    route,

    chainId,
  }
}
