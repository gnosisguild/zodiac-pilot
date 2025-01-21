import type { ExecutionRoute } from '@zodiac/schema'
import { redirect } from 'react-router'

export const editRoute = (currentUrl: string, route: ExecutionRoute) => {
  const url = new URL(currentUrl)

  return redirect(
    new URL(
      `/edit-route/${btoa(JSON.stringify(route))}`,
      url.origin,
    ).toString(),
  )
}
