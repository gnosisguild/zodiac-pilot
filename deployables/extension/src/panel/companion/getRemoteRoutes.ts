import { executionRouteSchema } from '@zodiac/schema'
import type { UUID } from 'crypto'
import { api, type FetchOptions } from './api'

export const getRemoteRoutes = (accountId: UUID, options: FetchOptions) =>
  api(`/extension/account/${accountId}/routes`, {
    ...options,
    schema: executionRouteSchema.array(),
  })
