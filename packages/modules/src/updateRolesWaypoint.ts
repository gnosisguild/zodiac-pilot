import { invariant } from '@epic-web/invariant'
import { getChainId } from '@zodiac/chains'
import type {
  ExecutionRoute,
  HexAddress,
  Waypoint,
  Waypoints,
} from '@zodiac/schema'
import { AccountType, prefixAddress } from 'ser-kit'
import { createEnabledConnection } from './createEnabledConnection'
import { createRolesWaypoint } from './createRolesWaypoint'
import { createSafeWaypoint } from './createSafeWaypoint'

type RoleUpdatePayload = {
  moduleAddress: HexAddress
  multisend: HexAddress[]
  version: 1 | 2
}

export const updateRolesWaypoint = (
  route: ExecutionRoute,
  { moduleAddress, multisend, version }: RoleUpdatePayload,
): ExecutionRoute => {
  const chainId = getChainId(route.avatar)

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
        return updateSafeConnection(waypoint, moduleAddress)
      }

      return createRolesWaypoint({
        address: moduleAddress,
        chainId,
        multisend,
        version,
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
      ...waypoints.map((waypoint) =>
        updateSafeConnection(waypoint, moduleAddress),
      ),
    ],
  }
}

const hasRolesWaypoint = (waypoints: Waypoints) =>
  waypoints.some((waypoint) => waypoint.account.type === AccountType.ROLES)

const updateSafeConnection = (
  waypoint: Waypoint,
  moduleAddress: HexAddress,
): Waypoint => {
  const { account } = waypoint

  if (account.type !== AccountType.SAFE) {
    return waypoint
  }

  return createSafeWaypoint({
    chainId: account.chain,
    safe: account.address,
    connection: createEnabledConnection(
      prefixAddress(account.chain, moduleAddress),
    ),
  })
}
