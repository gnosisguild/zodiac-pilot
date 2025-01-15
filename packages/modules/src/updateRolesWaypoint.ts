import { invariant } from '@epic-web/invariant'
import type { ExecutionRoute, HexAddress, Waypoints } from '@zodiac/schema'
import type { JsonRpcProvider } from 'ethers'
import { AccountType, splitPrefixedAddress } from 'ser-kit'
import { createRolesWaypoint } from './createRolesWaypoint'
import { queryRolesV1MultiSend } from './queryRolesV1MultiSend'
import { SupportedZodiacModuleType } from './ZodiacModule'

type RoleUpdatePayload = {
  moduleAddress: HexAddress
  type: SupportedZodiacModuleType
}

export const updateRolesWaypoint = async (
  provider: JsonRpcProvider,
  route: ExecutionRoute,
  { moduleAddress, type }: RoleUpdatePayload,
) => {
  switch (type) {
    case SupportedZodiacModuleType.ROLES_V1: {
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

      const multisend = await queryRolesV1MultiSend(provider, moduleAddress)

      const [startingPoint] = route.waypoints

      if (hasRolesWaypoint(route.waypoints)) {
        const newWaypoints = route.waypoints.map((waypoint) => {
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
          waypoints: newWaypoints,
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
            version: 1,
            from: startingPoint.account.prefixedAddress,
          }),
          ...route.waypoints.slice(1),
        ],
      }
    }
  }
}

const hasRolesWaypoint = (waypoints: Waypoints) =>
  waypoints.some((waypoint) => waypoint.account.type === AccountType.ROLES)
