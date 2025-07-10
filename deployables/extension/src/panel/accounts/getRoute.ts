import { getRemoteRoute, type FetchOptions } from '@/companion'
import {
  AD_HOC_ROUTE_ID,
  findAdHocRoute,
  getRoute as getLocalRoute,
} from '@/execution-routes'
import { invariant } from '@epic-web/invariant'
import { isUUID } from '@zodiac/schema'

export const getRoute = (routeId: string, options: FetchOptions) => {
  if (routeId === AD_HOC_ROUTE_ID) {
    const result = findAdHocRoute()
    invariant(result != null, 'Ad-hoc route not found')
    return result
  }

  if (isUUID(routeId)) {
    return getRemoteRoute(routeId, options)
  }

  return getLocalRoute(routeId)
}
