import { executionRouteSchema } from '@zodiac/schema'

/**
 * We support encoding a route in the `route` search param.
 * Such a route will be available to the current session but won't be persisted into the session storage
 */
export const getAdHocRoute = () => {
  const url = new URL(window.location.href)
  const route = url.searchParams.get('route')
  if (route == null) {
    return null
  }

  return executionRouteSchema.parse(JSON.parse(route))
}
