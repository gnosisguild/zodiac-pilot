import { invariant } from '@epic-web/invariant'
import { accountSchema } from '@zodiac/db/schema'
import { api, type FetchOptions } from './api'

export const getRemoteAccount = async (
  accountId: string,
  { signal }: FetchOptions = {},
) => {
  const account = await api(`/extension/account/${accountId}`, {
    signal,
    schema: accountSchema.nullable(),
  })

  invariant(
    account != null,
    `Could not find remote account with id "${accountId}"`,
  )

  return account
}
