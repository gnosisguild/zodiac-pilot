import type { Account, Wallet } from '@zodiac/db/schema'
import type { ExecutionRoute, Waypoints } from '@zodiac/schema'
import { prefixAddress } from 'ser-kit'

type ToExecutionRouteOptions = {
  wallet: Wallet
  account: Account
  waypoints: Waypoints
}

export const toExecutionRoute = ({
  wallet,
  account,
  waypoints,
}: ToExecutionRouteOptions): ExecutionRoute => ({
  id: account.id,
  avatar: prefixAddress(account.chainId, account.address),
  initiator: prefixAddress(undefined, wallet.address),
  waypoints,
})
