import { getRemoteAccount, toAccount } from '@/companion'
import { findRoute } from '@/execution-routes'
import type { FetchOptions } from '../companion/api'

export const getAccount = async (
  accountId: string,
  options: FetchOptions = {},
) => {
  const route = await findRoute(accountId)

  if (route != null) {
    return toAccount(route)
  }

  return getRemoteAccount(accountId, options)
}
