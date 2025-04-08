import type { ExecutionRoute } from '@zodiac/schema'
import { activateRoute } from './activateRoute'
import { loadRoutes } from './loadRoutes'

export const loadAndActivateRoute = async (route: Partial<ExecutionRoute>) => {
  const [fullRoute] = await loadRoutes(route)

  return activateRoute(fullRoute.id)
}
