import { getRemoteRoutes, type FetchOptions } from '@/companion'
import { AD_HOC_ROUTE_ID, findAdHocRoute, getRoute } from '@/execution-routes'
import { invariant } from '@epic-web/invariant'
import { isUUID } from '@zodiac/schema'
import type { UUID } from 'crypto'
import { getAccount } from './getAccount'

export const getRoutes = async (
  accountId: UUID | string,
  options: FetchOptions,
) => {
  if (accountId === AD_HOC_ROUTE_ID) {
    const adHocRoute = findAdHocRoute()
    invariant(adHocRoute != null, 'Ad-hoc route not found')
    return [adHocRoute]
  }

  if (isUUID(accountId)) {
    return getRemoteRoutes(accountId, options)
  }

  const account = await getAccount(accountId, options)
  invariant(!account.remote, 'Account must be local at this stage')
  return [await getRoute(accountId)]
}
