import { ETH_ZERO_ADDRESS } from '@/chains'
import { ProviderType, ZodiacRoute } from '@/types'
import { nanoid } from 'nanoid'
import { useSelectedRouteId } from './SelectedRouteContext'
import { useZodiacRoutes } from './ZodiacRoutesContext'
import { useConnectInjectedWalletIfNeeded } from './useConnectInjectedWalletIfNeeded'

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

  useConnectInjectedWalletIfNeeded(route)

  return route
}
