import { executionRouteSchema } from '@zodiac/schema'
import { api, type FetchOptions } from './api'

export const findRemoteDefaultRoute = async (
  accountId: string,
  { signal }: FetchOptions,
) =>
  api(`/extension/account/${accountId}/default-route`, {
    schema: executionRouteSchema.nullable(),
    signal,
  })
