import { getRemoteActiveRoute, type FetchOptions } from '@/companion'
import { findRoute } from '@/execution-routes'

export const getActiveRoute = async (
  accountId: string,
  options: FetchOptions = {},
) => {
  const route = await findRoute(accountId)

  if (route != null) {
    return route
  }

  return getRemoteActiveRoute(accountId, options)
}
