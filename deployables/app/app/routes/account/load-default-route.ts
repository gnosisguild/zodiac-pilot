import { href, redirect } from 'react-router'
import type { Route } from './+types/load-default-route'

export const loader = ({ params: { accountId } }: Route.LoaderArgs) =>
  redirect(href('/account/:accountId/route/:routeId?', { accountId }))
