import { href, redirect } from 'react-router'
import type { Route } from './+types/activeRoute'

export const loader = ({ params: { accountId } }: Route.LoaderArgs) =>
  redirect(href('/extension/account/:accountId/active-route', { accountId }))
