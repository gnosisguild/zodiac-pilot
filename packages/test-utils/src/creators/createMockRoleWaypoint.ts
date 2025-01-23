import { Chain } from '@zodiac/chains'
import type { HexAddress } from '@zodiac/schema'
import {
  AccountType,
  ConnectionType,
  formatPrefixedAddress,
  type ChainId,
  type PrefixedAddress,
  type Waypoint,
} from 'ser-kit'
import { randomAddress } from './randomHex'

type CreateRoleWaypointOptions = {
  moduleAddress?: HexAddress
  chainId?: ChainId
  version?: 1 | 2
  roleId?: string
  from?: PrefixedAddress
}

export const createMockRoleWaypoint = ({
  moduleAddress = randomAddress(),
  version = 2,
  chainId = Chain.ETH,
  roleId,
  from,
}: CreateRoleWaypointOptions = {}): Waypoint => ({
  account: {
    type: AccountType.ROLES,
    address: moduleAddress,
    prefixedAddress: formatPrefixedAddress(chainId, moduleAddress),
    chain: chainId,
    multisend: [],
    version,
  },
  connection: {
    from: from != null ? from : formatPrefixedAddress(chainId, randomAddress()),
    type: ConnectionType.IS_MEMBER,
    roles: roleId != null ? [roleId] : [],
  },
})
