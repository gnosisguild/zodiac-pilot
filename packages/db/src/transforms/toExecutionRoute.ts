import type { Account, Wallet } from '@zodiac/db/schema'
import type { Waypoints } from '@zodiac/schema'
import { prefixAddress, type Route } from 'ser-kit'

type ToExecutionRouteOptions = {
  wallet: Wallet
  account: Account
  waypoints: Waypoints
}

export const toExecutionRoute = ({
  wallet,
  account,
  waypoints,
}: ToExecutionRouteOptions): Route => ({
  id: account.id,
  avatar: prefixAddress(account.chainId, account.address),
  initiator: prefixAddress(undefined, wallet.address),
  waypoints,
})
