import { Chain } from '@zodiac/chains'
import type { HexAddress } from '@zodiac/schema'
import { randomAddress } from '@zodiac/test-utils'
import {
  AccountType,
  ConnectionType,
  prefixAddress,
  type ChainId,
  type PrefixedAddress,
  type Waypoint,
} from 'ser-kit'

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
    prefixedAddress: prefixAddress(chainId, moduleAddress),
    chain: chainId,
    multisend: [],
    version,
  },
  connection: {
    from: from != null ? from : prefixAddress(chainId, randomAddress()),
    type: ConnectionType.IS_MEMBER,
    roles: roleId != null ? [roleId] : [],
  },
})
