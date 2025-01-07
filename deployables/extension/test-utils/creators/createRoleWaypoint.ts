import type { HexAddress } from '@/types'
import {
  AccountType,
  ConnectionType,
  formatPrefixedAddress,
  type Waypoint,
} from 'ser-kit'
import { randomAddress, randomPrefixedAddress } from './randomHex'

type CreateRoleWaypointOptions = {
  moduleAddress?: HexAddress
}

export const createRoleWaypoint = ({
  moduleAddress = randomAddress(),
}: CreateRoleWaypointOptions = {}): Waypoint => ({
  account: {
    type: AccountType.ROLES,
    address: moduleAddress,
    prefixedAddress: formatPrefixedAddress(1, moduleAddress),
    chain: 1,
    multisend: [],
    version: 2,
  },
  connection: {
    from: randomPrefixedAddress(),
    type: ConnectionType.IS_MEMBER,
    roles: [],
  },
})
