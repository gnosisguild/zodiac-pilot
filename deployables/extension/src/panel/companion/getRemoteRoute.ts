import { executionRouteSchema } from '@zodiac/schema'
import type { UUID } from 'crypto'
import { api, type FetchOptions } from './api'

export const getRemoteRoute = (routeId: UUID, options: FetchOptions) =>
  api(`/extension/route/${routeId}`, {
    schema: executionRouteSchema,
    ...options,
  })
