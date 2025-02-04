import type { HexAddress, Waypoint } from '@zodiac/schema'
import {
  AccountType,
  ConnectionType,
  prefixAddress,
  type ChainId,
  type PrefixedAddress,
} from 'ser-kit'

type CreateRolesWaypointOptions = {
  chainId: ChainId
  from: PrefixedAddress
  address: HexAddress
  version: 1 | 2
  multisend: HexAddress[]
}

export const createRolesWaypoint = ({
  from,
  address,
  chainId,
  version,
  multisend,
}: CreateRolesWaypointOptions): Waypoint => ({
  account: {
    type: AccountType.ROLES,
    address,
    prefixedAddress: prefixAddress(chainId, address),
    multisend,
    chain: chainId,
    version,
  },
  connection: {
    from,
    roles: [],
    type: ConnectionType.IS_MEMBER,
  },
})
