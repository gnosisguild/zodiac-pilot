import type { HexAddress } from '@zodiac/schema'
import {
  AccountType,
  ConnectionType,
  formatPrefixedAddress,
  type Waypoint,
} from 'ser-kit'
import { randomAddress, randomPrefixedAddress } from './randomHex'

type CreateRoleWaypointOptions = {
  moduleAddress?: HexAddress
  version?: 1 | 2
  roleId?: string
}

export const createMockRoleWaypoint = ({
  moduleAddress = randomAddress(),
  version = 2,
  roleId,
}: CreateRoleWaypointOptions = {}): Waypoint => ({
  account: {
    type: AccountType.ROLES,
    address: moduleAddress,
    prefixedAddress: formatPrefixedAddress(1, moduleAddress),
    chain: 1,
    multisend: [],
    version,
  },
  connection: {
    from: randomPrefixedAddress(),
    type: ConnectionType.IS_MEMBER,
    roles: roleId != null ? [roleId] : [],
  },
})
