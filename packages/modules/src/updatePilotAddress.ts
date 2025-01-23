import type { ExecutionRoute, HexAddress, Waypoint } from '@zodiac/schema'
import {
  AccountType,
  ConnectionType,
  formatPrefixedAddress,
  splitPrefixedAddress,
} from 'ser-kit'
import { getStartingWaypoint } from './getStartingWaypoint'
import { getWaypoints } from './getWaypoints'
import { updateConnection } from './updateConnection'
import { updateStartingWaypoint } from './updateStartingWaypoint'

export const updatePilotAddress = (
  route: ExecutionRoute,
  address: HexAddress,
): ExecutionRoute => {
  const startingPoint = getStartingWaypoint(route.waypoints)
  const [chainId] = splitPrefixedAddress(startingPoint.account.prefixedAddress)
  const waypoints = getWaypoints(route)

  return {
    ...route,

    initiator: formatPrefixedAddress(chainId, address),
    waypoints: [
      updateStartingWaypoint(startingPoint, { address }),
      ...waypoints.map((waypoint) => updateWaypoint(waypoint, address)),
    ],
  }
}

const updateWaypoint = (
  { account, connection }: Waypoint,
  address: HexAddress,
): Waypoint => {
  if (account.type === AccountType.SAFE) {
    if (connection.type === ConnectionType.IS_ENABLED) {
      return { account, connection }
    }
  }

  return {
    account,
    connection: updateConnection(connection, { from: address }),
  }
}
