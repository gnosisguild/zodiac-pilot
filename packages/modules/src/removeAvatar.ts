import { invariant } from '@epic-web/invariant'
import { ZERO_ADDRESS } from '@zodiac/chains'
import type { ExecutionRoute } from '@zodiac/schema'
import {
  AccountType,
  formatPrefixedAddress,
  splitPrefixedAddress,
} from 'ser-kit'

export const removeAvatar = (route: ExecutionRoute): ExecutionRoute => {
  const [chainId] = splitPrefixedAddress(route.avatar)

  invariant(
    chainId,
    `Could not retrieve chain ID from avatar "${route.avatar}"`,
  )

  if (route.waypoints == null) {
    return { ...route, avatar: formatPrefixedAddress(chainId, ZERO_ADDRESS) }
  }

  const [startingPoint, ...waypoints] = route.waypoints

  return {
    ...route,
    avatar: formatPrefixedAddress(chainId, ZERO_ADDRESS),
    waypoints: [
      startingPoint,
      ...waypoints.filter(
        (waypoint) => waypoint.account.type !== AccountType.SAFE,
      ),
    ],
  }
}
