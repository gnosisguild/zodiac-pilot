import type { QueryRoutesResult } from './queryRoutes'

export const isValidRoute = (queryRoutesResult: QueryRoutesResult) =>
  queryRoutesResult.error != null || queryRoutesResult.routes.length > 0
