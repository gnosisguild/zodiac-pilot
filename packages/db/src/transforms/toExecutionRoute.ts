import { invariant } from '@epic-web/invariant'
import type { Account, Route, Wallet } from '@zodiac/db/schema'
import {
  createBlankRoute,
  updateAvatar,
  updateChainId,
  updateLabel,
} from '@zodiac/modules'
import type { ExecutionRoute } from '@zodiac/schema'
import { prefixAddress } from 'ser-kit'

type AccountOnlyOptions = {
  account: Account
}

type FullOptions = {
  wallet: Wallet
  account: Account
  route: Route
}

type ToExecutionRouteOptions = AccountOnlyOptions | FullOptions

export const toExecutionRoute = ({
  account,
  ...options
}: ToExecutionRouteOptions): ExecutionRoute => {
  if ('route' in options) {
    const { route, wallet } = options

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

  let executionRoute = updateChainId(
    updateAvatar(createBlankRoute(), { safe: account.address }),
    account.chainId,
  )

  if (account.label != null) {
    executionRoute = updateLabel(executionRoute, account.label)
  }

  return executionRoute
}
