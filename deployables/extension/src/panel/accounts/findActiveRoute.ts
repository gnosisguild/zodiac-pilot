import { findRemoteActiveRoute, type FetchOptions } from '@/companion'
import { findRoute } from '@/execution-routes'

export const findActiveRoute = async (
  accountId: string,
  options: FetchOptions = {},
) => {
  const route = await findRoute(accountId)

  if (route != null) {
    return route
  }

  return findRemoteActiveRoute(accountId, options)
}
