import { invariant } from '@epic-web/invariant'
import { executionRouteSchema } from '@zodiac/schema'
import { api, type FetchOptions } from './api'

export const getRemoteActiveRoute = async (
  accountId: string,
  { signal }: FetchOptions,
) => {
  const activeRoute = await api(`/extension/active-route/${accountId}`, {
    schema: executionRouteSchema.nullable(),
    signal,
  })

  invariant(
    activeRoute != null,
    `Could not find a local or remote route for account with id "${accountId}"`,
  )

  return activeRoute
}
