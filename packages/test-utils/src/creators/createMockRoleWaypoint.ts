import { Chain } from '@zodiac/chains'
import type { HexAddress } from '@zodiac/schema'
import {
  AccountType,
  ConnectionType,
  formatPrefixedAddress,
  type ChainId,
  type Waypoint,
} from 'ser-kit'
import { randomAddress } from './randomHex'

type CreateRoleWaypointOptions = {
  moduleAddress?: HexAddress
  chainId?: ChainId
  version?: 1 | 2
  roleId?: string
  from?: HexAddress
}

export const createMockRoleWaypoint = ({
  moduleAddress = randomAddress(),
  version = 2,
  chainId = Chain.ETH,
  roleId,
  from = randomAddress(),
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
    from: formatPrefixedAddress(chainId, from),
    type: ConnectionType.IS_MEMBER,
    roles: roleId != null ? [roleId] : [],
  },
})
