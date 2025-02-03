import { getChainId, ZERO_ADDRESS } from '@zodiac/chains'
import type { ExecutionRoute } from '@zodiac/schema'
import { prefixAddress } from 'ser-kit'

export const removeAvatar = (route: ExecutionRoute): ExecutionRoute => {
  const chainId = getChainId(route.avatar)

  if (route.waypoints == null) {
    return { ...route, avatar: prefixAddress(chainId, ZERO_ADDRESS) }
  }

  const [startingPoint] = route.waypoints

  return {
    ...route,
    avatar: prefixAddress(chainId, ZERO_ADDRESS),
    waypoints: [startingPoint],
  }
}
