import { parseRouteData } from '@/utils'
import { href, redirect } from 'react-router'
import type { Route } from './+types/extract-route-id-from-edit'

export const loader = ({ params: { data } }: Route.LoaderArgs) => {
  const route = parseRouteData(data)

  return redirect(href('/edit/:routeId/:data', { routeId: route.id, data }))
}
