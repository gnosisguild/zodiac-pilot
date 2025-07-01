import { getRemoteRoute, type FetchOptions } from '@/companion'
import { getRoute as getLocalRoute } from '@/execution-routes'
import { isUUID } from '@zodiac/schema'

export const getRoute = (routeId: string, options: FetchOptions) => {
  if (isUUID(routeId)) {
    return getRemoteRoute(routeId, options)
  }

  return getLocalRoute(routeId)
}
