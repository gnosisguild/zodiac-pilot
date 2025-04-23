import { getRemoteAccount, toAccount } from '@/companion'
import { findRoute } from '@/execution-routes'
import type { FetchOptions } from '../companion/api'
import type { TaggedAccount } from './TaggedAccount'
import { toLocalAccount } from './toLocalAccount'
import { toRemoteAccount } from './toRemoteAccount'

export const getAccount = async (
  accountId: string,
  options: FetchOptions = {},
): Promise<TaggedAccount> => {
  const route = await findRoute(accountId)

  if (route != null) {
    return toLocalAccount(toAccount(route))
  }

  const account = await getRemoteAccount(accountId, options)

  return toRemoteAccount(account)
}
