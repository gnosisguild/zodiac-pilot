import { executionRouteSchema, type ExecutionRoute } from '@zodiac/schema'

let adHocRoute: ExecutionRoute | null = null

/**
 * We support encoding a route in the `route` search param.
 * Such a route will be available to the current panel instance but won't be persisted into the session storage
 */
export const getAdHocRoute = (): ExecutionRoute | null => {
  if (adHocRoute == null) {
    const url = new URL(window.location.href)
    const route = url.searchParams.get('route')
    if (route != null) {
      // cache the route to keep a stable reference
      adHocRoute = executionRouteSchema.parse(JSON.parse(route))
    }
  }

  return adHocRoute
}
