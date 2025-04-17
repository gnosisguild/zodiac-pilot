import { invariant } from '@epic-web/invariant'
import { findRoute } from './findRoute'

export const getRoute = async (routeId: string) => {
  const route = await findRoute(routeId)

  invariant(route != null, `Could not find route with id "${routeId}"`)

  return route
}
