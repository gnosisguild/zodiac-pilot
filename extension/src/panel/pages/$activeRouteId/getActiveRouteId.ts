import { invariant } from '@epic-web/invariant'
import type { Params } from 'react-router'

export const getActiveRouteId = (params: Params) => {
  const { activeRouteId } = params

  invariant(activeRouteId != null, 'No "activeRouteId" found in params')

  return activeRouteId
}
