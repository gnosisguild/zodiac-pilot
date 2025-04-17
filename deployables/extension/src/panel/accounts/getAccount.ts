import { getRemoteAccount, toAccount } from '@/companion'
import { findRoute } from '@/execution-routes'
import type { FetchOptions } from '../companion/api'
import type { TaggedAccount } from './TaggedAccount'

export const getAccount = async (
  accountId: string,
  options: FetchOptions = {},
): Promise<TaggedAccount> => {
  const route = await findRoute(accountId)

  if (route != null) {
    return { ...toAccount(route), remote: false }
  }

  const account = await getRemoteAccount(accountId, options)

  return { ...account, remote: true }
}
