import { getRoute } from '@/execution-routes'
import type { TaggedAccount } from './TaggedAccount'

import { getRemoteRoutes, type FetchOptions } from '@/companion'

export const getRoutes = async (
  account: TaggedAccount,
  options: FetchOptions,
) => {
  if (!account.remote) {
    return [await getRoute(account.id)]
  }

  return getRemoteRoutes(account.id, options)
}
