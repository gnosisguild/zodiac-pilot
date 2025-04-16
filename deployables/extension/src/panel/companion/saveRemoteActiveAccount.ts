import { accountSchema } from '@zodiac/db/schema'
import type { PartialAccount } from './AccountContext'
import { api, type FetchOptions } from './api'

export const saveRemoteActiveAccount = async (
  account: PartialAccount,
  { signal }: FetchOptions,
) => {
  await api('/extension/active-account', {
    signal,
    schema: accountSchema.nullable(),
    body: { accountId: account.id },
  })
}
