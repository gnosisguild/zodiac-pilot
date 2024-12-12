import { invariant } from '@epic-web/invariant'
import { type Params } from 'react-router'

export const getRouteId = (params: Params) => {
  const { routeId } = params

  invariant(routeId != null, 'No "routeId" found in params')

  return routeId
}
