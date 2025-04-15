import { accountSchema } from '@zodiac/db/schema'
import { api, type FetchOptions } from './api'

export const getAccount = (accountId: string, { signal }: FetchOptions) =>
  api(`/extension/account/${accountId}`, {
    signal,
    schema: accountSchema.nullable(),
  })
