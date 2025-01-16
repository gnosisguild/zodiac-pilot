import { invariant } from '@epic-web/invariant'
import type { ExecutionRoute, HexAddress, Waypoints } from '@zodiac/schema'
import { AccountType, splitPrefixedAddress } from 'ser-kit'
import { createRolesWaypoint } from './createRolesWaypoint'

type RoleUpdatePayload = {
  moduleAddress: HexAddress
  multisend: HexAddress[]
  version: 1 | 2
}

export const updateRolesWaypoint = (
  route: ExecutionRoute,
  { moduleAddress, multisend, version }: RoleUpdatePayload,
): ExecutionRoute => {
  const [chainId] = splitPrefixedAddress(route.avatar)

  invariant(
    chainId != null,
    `chainId is required but could not be retrieved from avatar "${route.avatar}"`,
  )

  invariant(
    route.waypoints,
    'Route does not specify any waypoints. Cannot update mod.',
  )

  invariant(
    route.waypoints.length >= 2,
    'The route needs at least a start and an end waypoint to define a mod in between.',
  )

  const [startingPoint, ...waypoints] = route.waypoints

  if (hasRolesWaypoint(route.waypoints)) {
    const newWaypoints = waypoints.map((waypoint) => {
      if (waypoint.account.type !== AccountType.ROLES) {
        return waypoint
      }

      return createRolesWaypoint({
        address: moduleAddress,
        chainId,
        multisend,
        version: 1,
        from: startingPoint.account.prefixedAddress,
      })
    })

    return {
      ...route,
      waypoints: [startingPoint, ...newWaypoints],
    }
  }

  return {
    ...route,
    waypoints: [
      startingPoint,
      createRolesWaypoint({
        address: moduleAddress,
        chainId,
        multisend,
        version,
        from: startingPoint.account.prefixedAddress,
      }),
      ...waypoints,
    ],
  }
}

const hasRolesWaypoint = (waypoints: Waypoints) =>
  waypoints.some((waypoint) => waypoint.account.type === AccountType.ROLES)
