import { getChainId } from '@zodiac/chains'
import {
  ProviderType,
  type ExecutionRoute,
  type Waypoint,
} from '@zodiac/schema'
import {
  AccountType,
  ConnectionType,
  prefixAddress,
  type PrefixedAddress,
} from 'ser-kit'
import { createEoaWaypoint } from './createEoaWaypoint'
import { createSafeStartingPoint } from './createSafeStartingPoint'
import { getStartingWaypoint } from './getStartingWaypoint'
import { getWaypoints } from './getWaypoints'

export const updateProviderType = (
  route: ExecutionRoute,
  providerType: ProviderType,
): ExecutionRoute => {
  const {
    account: { address },
  } = getStartingWaypoint(route.waypoints)
  const waypoints = getWaypoints(route)

  switch (providerType) {
    case ProviderType.InjectedWallet: {
      const initiator = prefixAddress(undefined, address)

      return {
        ...route,
        initiator,
        providerType: ProviderType.InjectedWallet,
        waypoints: [
          createEoaWaypoint({
            address,
          }),
          ...waypoints.map((waypoint) => updateWaypoint(waypoint, initiator)),
        ],
      }
    }

    case ProviderType.WalletConnect: {
      const chainId = getChainId(route.avatar)

      const initiator = prefixAddress(chainId, address)

      return {
        ...route,
        initiator,
        providerType: ProviderType.WalletConnect,
        waypoints: [
          createSafeStartingPoint({
            chainId,
            address,
          }),
          ...waypoints.map((waypoint) => updateWaypoint(waypoint, initiator)),
        ],
      }
    }
  }
}

const updateWaypoint = (
  { account, connection }: Waypoint,
  from: PrefixedAddress,
): Waypoint => {
  if (account.type === AccountType.ROLES) {
    return { account, connection: { ...connection, from } }
  }

  if (account.type === AccountType.SAFE) {
    if (connection.type === ConnectionType.OWNS) {
      return { account, connection: { ...connection, from } }
    }
  }

  return { account, connection }
}
