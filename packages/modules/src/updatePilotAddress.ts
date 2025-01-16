import { getChainId } from '@zodiac/chains'
import type { ExecutionRoute, HexAddress } from '@zodiac/schema'
import { formatPrefixedAddress } from 'ser-kit'
import { getStartingWaypoint } from './getStartingWaypoint'
import { updateStartingWaypoint } from './updateStartingWaypoint'

export const updatePilotAddress = (
  route: ExecutionRoute,
  address: HexAddress,
): ExecutionRoute => {
  const startingPoint = getStartingWaypoint(route.waypoints)
  const chainId = getChainId(route.avatar)

  return {
    ...route,

    initiator: formatPrefixedAddress(chainId, address),
    waypoints: [updateStartingWaypoint(startingPoint, { address })],
  }
}
