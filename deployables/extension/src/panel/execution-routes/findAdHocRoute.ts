import type { Account } from '@/companion'
import {
  executionRouteSchema,
  jsonParse,
  type ExecutionRoute,
} from '@zodiac/schema'

export const AD_HOC_ROUTE_ID = 'ad-hoc'

let adHocRoute: ExecutionRoute | null = null

/**
 * We support encoding a route in the `route` search param.
 * Such a route will be available to the current panel instance but won't be persisted into sync storage.
 */
export const findAdHocRoute = (): ExecutionRoute | null => {
  if (adHocRoute == null) {
    const url = new URL(window.location.href)
    const route = url.searchParams.get('route')
    if (route != null) {
      // cache the route to keep a stable reference
      adHocRoute = executionRouteSchema.parse(jsonParse(route))
    }
  }

  return adHocRoute
}

export const isAdHocAccount = (account: Account) =>
  account.id === AD_HOC_ROUTE_ID
