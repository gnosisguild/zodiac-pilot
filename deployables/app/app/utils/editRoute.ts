import type { ExecutionRoute } from '@zodiac/schema'

export const editRoute = (currentUrl: string, route: ExecutionRoute) => {
  const url = new URL(currentUrl)

  return Response.redirect(
    new URL(`/edit-route/${btoa(JSON.stringify(route))}`, url.origin),
  )
}
