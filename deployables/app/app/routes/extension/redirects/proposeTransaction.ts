import { href, redirect } from 'react-router'
import type { Route } from './+types/proposeTransaction'

export const loader = ({ params: { accountId } }: Route.LoaderArgs) =>
  redirect(
    href('/extension/account/:accountId/propose-transaction', { accountId }),
  )
