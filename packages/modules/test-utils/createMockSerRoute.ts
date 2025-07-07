import { getChainId } from '@zodiac/chains'
import { randomAddress, randomPrefixedAddress } from '@zodiac/test-utils'
import { randomUUID } from 'crypto'
import { prefixAddress, unprefixAddress, type Route } from 'ser-kit'
import { createMockEndWaypoint } from './createMockEndWaypoint'
import { createMockEoaAccount } from './createMockEoaAccount'
import { createMockOwnsConnection } from './createMockOwnsConnection'
import { createMockSafeAccount } from './createMockSafeAccount'
import { createMockStartingWaypoint } from './createMockStartingWaypoint'
import { createMockWaypoints } from './createMockWaypoints'

export const createMockSerRoute = ({
  initiator = prefixAddress(undefined, randomAddress()),
  avatar = randomPrefixedAddress(),
  ...route
}: Partial<Route> = {}): Route => ({
  id: randomUUID(),
  avatar,
  initiator,
  waypoints: createMockWaypoints({
    start: createMockStartingWaypoint(
      createMockEoaAccount({ address: unprefixAddress(initiator) }),
    ),
    end: createMockEndWaypoint({
      account: createMockSafeAccount({
        chainId: getChainId(avatar),
        address: unprefixAddress(avatar),
      }),
      connection: createMockOwnsConnection(initiator),
    }),
  }),

  ...route,
})
