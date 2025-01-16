import type { HexAddress } from '@zodiac/schema'
import {
  AccountType,
  ConnectionType,
  formatPrefixedAddress,
  type ChainId,
  type PrefixedAddress,
  type Waypoint,
} from 'ser-kit'

type CreateSafeWaypointOptions = {
  safe: HexAddress
  chainId: ChainId
  pilotAddress: PrefixedAddress
  moduleAddress?: PrefixedAddress
}

export const createSafeWaypoint = ({
  chainId,
  safe,
  moduleAddress,
  pilotAddress,
}: CreateSafeWaypointOptions): Waypoint => ({
  account: {
    type: AccountType.SAFE,
    address: safe,
    chain: chainId,
    prefixedAddress: formatPrefixedAddress(chainId, safe),
    threshold: NaN,
  },
  connection:
    moduleAddress != null
      ? { type: ConnectionType.IS_ENABLED, from: moduleAddress }
      : { type: ConnectionType.OWNS, from: pilotAddress },
})
