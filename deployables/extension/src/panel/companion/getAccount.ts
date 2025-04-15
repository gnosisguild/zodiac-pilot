import { getRoute, toAccount } from '@/execution-routes'
import { invariant } from '@epic-web/invariant'
import { accountSchema } from '@zodiac/db/schema'
import { api, type FetchOptions } from './api'

export const getAccount = async (
  accountId: string,
  { signal }: FetchOptions,
) => {
  const account = await api(`/extension/account/${accountId}`, {
    signal,
    schema: accountSchema.nullable(),
  })

  if (account != null) {
    return account
  }

  const route = await getRoute(accountId)

  invariant(
    route != null,
    `Could not find local or remote account with id "${accountId}"`,
  )

  return toAccount(route)
}
