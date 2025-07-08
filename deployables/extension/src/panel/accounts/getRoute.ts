import { getRemoteRoute, type FetchOptions } from '@/companion'
import { getAdHocRoute, getRoute as getLocalRoute } from '@/execution-routes'
import { invariant } from '@epic-web/invariant'
import { isUUID } from '@zodiac/schema'

export const getRoute = (routeId: string, options: FetchOptions) => {
  if (routeId === 'ad-hoc') {
    const result = getAdHocRoute()
    invariant(result != null, 'Ad-hoc route not found')
    return result
  }

  if (isUUID(routeId)) {
    return getRemoteRoute(routeId, options)
  }

  return getLocalRoute(routeId)
}
