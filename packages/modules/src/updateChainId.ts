import type { ChainId } from '@zodiac/chains'
import type {
  Connection,
  ExecutionRoute,
  StartingWaypoint,
  Waypoint,
} from '@zodiac/schema'
import {
  AccountType,
  formatPrefixedAddress,
  parsePrefixedAddress,
  splitPrefixedAddress,
  type PrefixedAddress,
} from 'ser-kit'
import { createDelayWaypoint } from './createDelayWaypoint'
import { createEoaWaypoint } from './createEoaWaypoint'
import { createRolesWaypoint } from './createRolesWaypoint'
import { createSafeStartingPoint } from './createSafeStartingPoint'
import { createSafeWaypoint } from './createSafeWaypoint'
import { getStartingWaypoint } from './getStartingWaypoint'
import { getWaypoints } from './getWaypoints'

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
      updateStartingWaypoint(startingPoint, chainId),
      ...waypoints.map((waypoint) => updateWaypoint(waypoint, chainId)),
    ],
  }
}

const updateStartingWaypoint = (
  { account }: StartingWaypoint,
  chainId: ChainId,
): StartingWaypoint => {
  switch (account.type) {
    case AccountType.EOA: {
      return createEoaWaypoint({ address: account.address, chainId })
    }

    default: {
      return createSafeStartingPoint({ address: account.address, chainId })
    }
  }
}

const updateWaypoint = (
  { account, connection }: Waypoint,
  chainId: ChainId,
): Waypoint => {
  switch (account.type) {
    case AccountType.ROLES: {
      return createRolesWaypoint({
        from: updatePrefixedAddress(connection.from, chainId),
        multisend: account.multisend,
        version: account.version,
        address: account.address,
        chainId,
      })
    }
    case AccountType.SAFE: {
      return createSafeWaypoint({
        chainId,
        connection: updateConnection(connection, chainId),
        safe: account.address,
      })
    }
    case AccountType.DELAY: {
      return createDelayWaypoint({
        chainId,
        moduleAddress: account.address,
        connection: updateConnection(connection, chainId),
      })
    }

    default: {
      throw new Error(`Cannot update waypoint of type "${account.type}"`)
    }
  }
}

const updatePrefixedAddress = (
  prefixedAddress: PrefixedAddress,
  chainId: ChainId,
) => {
  const address = parsePrefixedAddress(prefixedAddress)

  return formatPrefixedAddress(chainId, address)
}

const updateConnection = <T extends Connection>(
  connection: T,
  chainId: ChainId,
): T => ({
  ...connection,

  from: updatePrefixedAddress(connection.from, chainId),
})
