import { invariant } from '@epic-web/invariant'
import type { Account, Route, Wallet } from '@zodiac/db/schema'
import type { ExecutionRoute } from '@zodiac/schema'
import { prefixAddress } from 'ser-kit'

type ToExecutionRouteOptions = {
  wallet: Wallet
  account: Account
  route: Route
}

export const toExecutionRoute = ({
  account,
  wallet,
  route,
}: ToExecutionRouteOptions): ExecutionRoute => {
  invariant(route.fromId === wallet.id, 'Route does not match wallet')
  invariant(route.toId === account.id, 'Route does not match account')

  return {
    id: route.id,
    label: route.label,
    avatar: prefixAddress(account.chainId, account.address),
    initiator: prefixAddress(undefined, wallet.address),
    waypoints: route.waypoints,
  }
}
