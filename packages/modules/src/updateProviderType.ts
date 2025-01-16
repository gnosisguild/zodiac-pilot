import { getChainId } from '@zodiac/chains'
import { ProviderType, type ExecutionRoute } from '@zodiac/schema'
import { createEoaWaypoint } from './createEoaWaypoint'
import { createSafeStartingPoint } from './createSafeStartingPoint'
import { getStartingWaypoint } from './getStartingWaypoint'
import { getWaypoints } from './getWaypoints'

export const updateProviderType = (
  route: ExecutionRoute,
  providerType: ProviderType,
): ExecutionRoute => {
  const {
    account: { address, prefixedAddress },
  } = getStartingWaypoint(route.waypoints)
  const waypoints = getWaypoints(route)
  const chainId = getChainId(prefixedAddress)

  switch (providerType) {
    case ProviderType.InjectedWallet: {
      return {
        ...route,
        waypoints: [
          createEoaWaypoint({
            chainId,
            address,
          }),
          ...waypoints,
        ],
      }
    }

    default: {
      return {
        ...route,
        waypoints: [
          createSafeStartingPoint({
            chainId,
            address,
          }),
          ...waypoints,
        ],
      }
    }
  }
}
