import { invariant } from '@epic-web/invariant'
import { getChainId } from '@zodiac/chains'
import {
  type ExecutionRoute,
  type HexAddress,
  type Waypoint,
} from '@zodiac/schema'
import { AccountType, formatPrefixedAddress } from 'ser-kit'
import { createEnabledConnection } from './createEnabledConnection'
import { createOwnsConnection } from './createOwnsConnection'
import { createSafeWaypoint } from './createSafeWaypoint'

type UpdateAvatarOptions = {
  safe: HexAddress
}

export const updateAvatar = (
  route: ExecutionRoute,
  options: UpdateAvatarOptions,
) => updateAvatarProperty(updateEndWaypoint(route, options), options)

const updateEndWaypoint = (
  route: ExecutionRoute,
  { safe }: UpdateAvatarOptions,
): ExecutionRoute => {
  const chainId = getChainId(route.avatar)

  invariant(
    route.waypoints,
    'Route does not specify any waypoints. Cannot update safe.',
  )

  const [startingPoint, ...waypoints] = route.waypoints

  const roleWaypoint = waypoints.find(
    (waypoint) => waypoint.account.type === AccountType.ROLES,
  )

  const pilotAddress = formatPrefixedAddress(
    startingPoint.account.type === AccountType.EOA ? undefined : chainId,
    startingPoint.account.address,
  )

  const updatedWaypoint = createSafeWaypoint({
    chainId,
    safe,
    connection:
      roleWaypoint == null
        ? createOwnsConnection(pilotAddress)
        : createEnabledConnection(roleWaypoint.account.prefixedAddress),
  })

  if (hasSafeWaypoint(waypoints)) {
    return {
      ...route,
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
    waypoints: [startingPoint, ...waypoints, updatedWaypoint],
  }
}

const updateAvatarProperty = (
  route: ExecutionRoute,
  { safe }: UpdateAvatarOptions,
): ExecutionRoute => {
  const chainId = getChainId(route.avatar)

  return {
    ...route,
    avatar: formatPrefixedAddress(chainId, safe),
  }
}

const hasSafeWaypoint = (waypoints: Waypoint[]): boolean =>
  waypoints.some((waypoint) => waypoint.account.type === AccountType.SAFE)
