import type { Connection } from '@zodiac/schema'
import { ConnectionType, type PrefixedAddress } from 'ser-kit'
import { randomPrefixedAddress } from './randomHex'

export const createMockEnabledConnection = (
  from: PrefixedAddress = randomPrefixedAddress(),
): Connection => ({
  type: ConnectionType.IS_ENABLED,
  from,
})
