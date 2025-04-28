import { invariant } from '@epic-web/invariant'
import type { Account, Route, Wallet } from '@zodiac/db/schema'
import { prefixAddress, type Route as SerRoute } from 'ser-kit'

type ToExecutionRouteOptions = {
  wallet: Wallet
  account: Account
  route: Route
}

export const toExecutionRoute = ({
  wallet,
  account,
  route,
}: ToExecutionRouteOptions): SerRoute => {
  invariant(route.fromId === wallet.id, 'Route does not match wallet')
  invariant(route.toId === account.id, 'Route does not match account')

  return {
    id: account.id,
    avatar: prefixAddress(account.chainId, account.address),
    initiator: prefixAddress(undefined, wallet.address),
    waypoints: route.waypoints,
  }
}
