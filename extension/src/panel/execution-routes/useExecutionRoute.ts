import { ETH_ZERO_ADDRESS } from '@/chains'
import { type ExecutionRoute, ProviderType } from '@/types'
import { nanoid } from 'nanoid'
import { useExecutionRoutes } from './ExecutionRoutesContext'
import { useSelectedRouteId } from './SelectedRouteContext'

export const INITIAL_DEFAULT_ROUTE: ExecutionRoute = {
  id: nanoid(),
  label: '',
  providerType: ProviderType.InjectedWallet,
  avatar: ETH_ZERO_ADDRESS,
  initiator: undefined,
  waypoints: undefined,
}

export const useExecutionRoute = (id?: string) => {
  const routes = useExecutionRoutes()
  const [selectedRouteId] = useSelectedRouteId()

  const routeId = id || selectedRouteId
  const route =
    (routeId && routes.find((c) => c.id === routeId)) ||
    routes[0] ||
    INITIAL_DEFAULT_ROUTE

  return route
}
