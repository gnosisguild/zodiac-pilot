import { findRoute } from '@/execution-routes'
import { invariant } from '@epic-web/invariant'
import { accountSchema } from '@zodiac/db/schema'
import { api, type FetchOptions } from './api'
import { toAccount } from './toAccount'

export const getRemoteAccount = async (
  accountId: string,
  { signal }: FetchOptions = {},
) => {
  const route = await findRoute(accountId)

  if (route != null) {
    return toAccount(route)
  }

  const account = await api(`/extension/account/${accountId}`, {
    signal,
    schema: accountSchema.nullable(),
  })

  invariant(
    account != null,
    `Could not find local or remote account with id "${accountId}"`,
  )

  return account
}
