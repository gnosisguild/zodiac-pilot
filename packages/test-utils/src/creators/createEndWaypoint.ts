import type { Waypoint } from '@zodiac/schema'
import { ConnectionType } from 'ser-kit'
import { createSafeAccount, type Safe } from './createSafeAccount'
import { randomPrefixedAddress } from './randomHex'

export const createEndWaypoint = (account: Partial<Safe> = {}): Waypoint => ({
  account: createSafeAccount(account),
  connection: {
    type: ConnectionType.IS_ENABLED,
    from: randomPrefixedAddress(),
  },
})
