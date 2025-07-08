import { href, redirect } from 'react-router'
import type { Route } from './+types/offline-sign-transaction'

export const loader = ({ params: { route, transactions } }: Route.LoaderArgs) =>
  redirect(
    href('/offline/submit/:route/:transactions', { route, transactions }),
  )
