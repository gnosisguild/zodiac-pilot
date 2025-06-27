import type { FetchOptions } from '@/companion'
import { invariant } from '@epic-web/invariant'
import { findDefaultRoute } from './findDefaultRoute'

export const getDefaultRoute = async (
  accountId: string,
  options: FetchOptions = {},
) => {
  const activeRoute = await findDefaultRoute(accountId, options)

  invariant(
    activeRoute != null,
    `Could not find active route for account with id "${accountId}"`,
  )

  return activeRoute
}
