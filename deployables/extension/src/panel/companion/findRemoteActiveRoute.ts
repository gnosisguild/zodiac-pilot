import { executionRouteSchema } from '@zodiac/schema'
import { api, type FetchOptions } from './api'

export const findRemoteActiveRoute = async (
  accountId: string,
  { signal }: FetchOptions,
) =>
  api(`/extension/active-route/${accountId}`, {
    schema: executionRouteSchema.nullable(),
    signal,
  })
