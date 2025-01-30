import type { ExecutionRoute, Waypoint } from '@zodiac/schema'
import { type PrefixedAddress, type StartingPoint } from 'ser-kit'
import { getWaypoints } from './getWaypoints'

export const updateStartingPoint = (
  route: ExecutionRoute,
  account: StartingPoint['account'],
): ExecutionRoute => {
  const [nextWaypoint, ...otherWaypoints] = getWaypoints(route)

  if (nextWaypoint == null) {
    return {
      ...route,

      initiator: account.prefixedAddress,
      waypoints: [{ account }],
    }
  }

  return {
    ...route,

    initiator: account.prefixedAddress,
    waypoints: [
      { account },
      updateWaypointConnection(nextWaypoint, account.prefixedAddress),
      ...otherWaypoints,
    ],
  }
}

const updateWaypointConnection = (
  waypoint: Waypoint,
  connectedFrom: PrefixedAddress,
): Waypoint => {
  return {
    ...waypoint,
    connection: { ...waypoint.connection, from: connectedFrom },
  }
}
