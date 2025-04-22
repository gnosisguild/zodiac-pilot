import { saveRemoteActiveAccount, type FetchOptions } from '@/companion'
import { saveLastUsedAccountId } from '@/execution-routes'
import type { TaggedAccount } from './TaggedAccount'

export const saveActiveAccount = async (
  taggedAccount: TaggedAccount | null,
  options: FetchOptions = {},
) => {
  if (taggedAccount == null) {
    return Promise.all([
      saveRemoteActiveAccount(null, options),
      saveLastUsedAccountId(null),
    ])
  }

  const { remote: _remote, ...account } = taggedAccount

  return Promise.all([
    saveRemoteActiveAccount(account, options),
    saveLastUsedAccountId(account.id),
  ])
}
