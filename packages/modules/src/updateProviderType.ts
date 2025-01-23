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
    account: { address },
  } = getStartingWaypoint(route.waypoints)
  const waypoints = getWaypoints(route)

  switch (providerType) {
    case ProviderType.InjectedWallet: {
      return {
        ...route,
        providerType: ProviderType.InjectedWallet,
        waypoints: [
          createEoaWaypoint({
            address,
          }),
          ...waypoints,
        ],
      }
    }

    case ProviderType.WalletConnect: {
      const chainId = getChainId(route.avatar)

      return {
        ...route,
        providerType: ProviderType.WalletConnect,
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
