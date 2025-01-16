import type { Connection } from '@zodiac/schema'
import { ConnectionType, type PrefixedAddress } from 'ser-kit'
import { randomPrefixedAddress } from './randomHex'

export const createMockOwnsConnection = (
  from: PrefixedAddress = randomPrefixedAddress(),
): Connection => ({
  type: ConnectionType.OWNS,
  from,
})
