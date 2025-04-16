import {
  saveRemoteActiveAccount,
  type Account,
  type FetchOptions,
} from '@/companion'
import { saveLastUsedAccountId } from '@/execution-routes'

export const saveActiveAccount = async (
  account: Account,
  options: FetchOptions = {},
) => {
  await Promise.all([
    saveRemoteActiveAccount(account, options),
    saveLastUsedAccountId(account.id),
  ])
}
