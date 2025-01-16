import type { Waypoint } from '@zodiac/schema'
import { ConnectionType } from 'ser-kit'
import { createMockSafeAccount, type Safe } from './createMockSafeAccount'
import { randomPrefixedAddress } from './randomHex'

export const createMockEndWaypoint = (
  account: Partial<Safe> = {},
): Waypoint => ({
  account: createMockSafeAccount(account),
  connection: {
    type: ConnectionType.IS_ENABLED,
    from: randomPrefixedAddress(),
  },
})
