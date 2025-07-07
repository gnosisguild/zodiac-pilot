import type { Connection } from '@zodiac/schema'
import { randomPrefixedAddress } from '@zodiac/test-utils'
import { ConnectionType, type PrefixedAddress } from 'ser-kit'

export const createMockOwnsConnection = (
  from: PrefixedAddress = randomPrefixedAddress(),
): Connection => ({
  type: ConnectionType.OWNS,
  from,
})
