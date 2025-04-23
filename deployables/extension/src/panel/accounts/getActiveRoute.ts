import type { FetchOptions } from '@/companion'
import { invariant } from '@epic-web/invariant'
import { findActiveRoute } from './findActiveRoute'

export const getActiveRoute = async (
  accountId: string,
  options: FetchOptions = {},
) => {
  const activeRoute = await findActiveRoute(accountId, options)

  invariant(
    activeRoute != null,
    `Could not find active route for account with id "${accountId}"`,
  )

  return activeRoute
}
