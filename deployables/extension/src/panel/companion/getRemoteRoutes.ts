import { routeSchema } from '@zodiac/db/schema'
import type { UUID } from 'crypto'
import { api, type FetchOptions } from './api'

export const getRemoteRoutes = (accountId: UUID, options: FetchOptions) =>
  api(`/extension/account/${accountId}/routes`, {
    ...options,
    schema: routeSchema.array(),
  })
