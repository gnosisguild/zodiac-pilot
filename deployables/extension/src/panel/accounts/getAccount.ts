import { getRemoteAccount, toAccount } from '@/companion'
import { findAdHocRoute, findRoute } from '@/execution-routes'
import type { FetchOptions } from '../companion/api'
import type { TaggedAccount } from './TaggedAccount'
import { toLocalAccount } from './toLocalAccount'
import { toRemoteAccount } from './toRemoteAccount'

export const getAccount = async (
  accountId: string,
  options: FetchOptions = {},
): Promise<TaggedAccount> => {
  // 1) try ad-hoc route (encoded in location search param)
  const adHocRoute = findAdHocRoute()
  if (adHocRoute != null && adHocRoute.id === accountId) {
    return toLocalAccount(toAccount(adHocRoute))
  }

  // 2) try route from storage
  const route = await findRoute(accountId)
  if (route != null) {
    return toLocalAccount(toAccount(route))
  }

  // 3) try remote account
  const account = await getRemoteAccount(accountId, options)
  return toRemoteAccount(account)
}
