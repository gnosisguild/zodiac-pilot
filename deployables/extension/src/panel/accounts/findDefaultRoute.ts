import { findRemoteActiveRoute, type FetchOptions } from '@/companion'
import { findRoute } from '@/execution-routes'

export const findDefaultRoute = async (
  accountId: string,
  options: FetchOptions = {},
) => {
  const route = await findRoute(accountId)

  if (route != null) {
    return route
  }

  return findRemoteActiveRoute(accountId, options)
}
