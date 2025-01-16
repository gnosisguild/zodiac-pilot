import { invariant } from '@epic-web/invariant'
import {
  type ExecutionRoute,
  type HexAddress,
  type Waypoint,
} from '@zodiac/schema'
import {
  AccountType,
  formatPrefixedAddress,
  splitPrefixedAddress,
} from 'ser-kit'
import { createSafeWaypoint } from './createSafeWaypoint'

type UpdateAvatarOptions = {
  safe: HexAddress
}

export const updateAvatar = (
  route: ExecutionRoute,
  { safe }: UpdateAvatarOptions,
): ExecutionRoute => {
  const [chainId] = splitPrefixedAddress(route.avatar)

  invariant(
    chainId != null,
    `Could not retrieve chain from route avatar "${route.avatar}"`,
  )

  invariant(
    route.waypoints,
    'Route does not specify any waypoints. Cannot update safe.',
  )

  const [startingPoint, ...waypoints] = route.waypoints

  const roleWaypoint = waypoints.find(
    (waypoint) => waypoint.account.type === AccountType.ROLES,
  )

  const updatedWaypoint = createSafeWaypoint({
    chainId,
    safe,
    pilotAddress: formatPrefixedAddress(
      startingPoint.account.type === AccountType.EOA ? undefined : chainId,
      startingPoint.account.address,
    ),
    moduleAddress:
      roleWaypoint != null ? roleWaypoint.account.prefixedAddress : undefined,
  })

  if (hasSafeWaypoint(waypoints)) {
    return {
      ...route,
      avatar: formatPrefixedAddress(chainId, safe),
      waypoints: [
        startingPoint,
        ...waypoints.map((waypoint) => {
          if (waypoint.account.type !== AccountType.SAFE) {
            return waypoint
          }

          return updatedWaypoint
        }),
      ],
    }
  }

  return {
    ...route,
    avatar: formatPrefixedAddress(chainId, safe),
    waypoints: [startingPoint, updatedWaypoint],
  }
}

const hasSafeWaypoint = (waypoints: Waypoint[]): boolean =>
  waypoints.some((waypoint) => waypoint.account.type === AccountType.SAFE)
