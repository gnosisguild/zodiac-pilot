import type { ChainId } from '@zodiac/chains'
import type { ExecutionRoute, Waypoint } from '@zodiac/schema'
import {
  AccountType,
  formatPrefixedAddress,
  splitPrefixedAddress,
} from 'ser-kit'
import { createDelayWaypoint } from './createDelayWaypoint'
import { createRolesWaypoint } from './createRolesWaypoint'
import { createSafeWaypoint } from './createSafeWaypoint'
import { getStartingWaypoint } from './getStartingWaypoint'
import { getWaypoints } from './getWaypoints'
import { updateConnection } from './updateConnection'
import { updatePrefixedAddress } from './updatePrefixedAddress'
import { updateStartingWaypoint } from './updateStartingWaypoint'

export const updateChainId = (
  route: ExecutionRoute,
  chainId: ChainId,
): ExecutionRoute => {
  const [, address] = splitPrefixedAddress(route.avatar)
  const startingPoint = getStartingWaypoint(route.waypoints)
  const waypoints = getWaypoints(route)

  return {
    ...route,
    avatar: formatPrefixedAddress(chainId, address),
    waypoints: [
      updateStartingWaypoint(startingPoint, { chainId }),
      ...waypoints.map((waypoint) => updateWaypoint(waypoint, chainId)),
    ],
  }
}

const updateWaypoint = (
  { account, connection }: Waypoint,
  chainId: ChainId,
): Waypoint => {
  switch (account.type) {
    case AccountType.ROLES: {
      return createRolesWaypoint({
        from: updatePrefixedAddress(connection.from, { chainId }),
        multisend: account.multisend,
        version: account.version,
        address: account.address,
        chainId,
      })
    }
    case AccountType.SAFE: {
      return createSafeWaypoint({
        chainId,
        connection: updateConnection(connection, { chainId }),
        safe: account.address,
      })
    }
    case AccountType.DELAY: {
      return createDelayWaypoint({
        chainId,
        moduleAddress: account.address,
        connection: updateConnection(connection, { chainId }),
      })
    }

    default: {
      throw new Error(`Cannot update waypoint of type "${account.type}"`)
    }
  }
}
