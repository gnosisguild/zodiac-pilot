import { getChainId, ZERO_ADDRESS } from '@zodiac/chains'
import type { ExecutionRoute } from '@zodiac/schema'
import { formatPrefixedAddress } from 'ser-kit'

export const removeAvatar = (route: ExecutionRoute): ExecutionRoute => {
  const chainId = getChainId(route.avatar)

  if (route.waypoints == null) {
    return { ...route, avatar: formatPrefixedAddress(chainId, ZERO_ADDRESS) }
  }

  const [startingPoint] = route.waypoints

  return {
    ...route,
    avatar: formatPrefixedAddress(chainId, ZERO_ADDRESS),
    waypoints: [startingPoint],
  }
}
