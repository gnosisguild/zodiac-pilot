import { Chain, ZERO_ADDRESS } from '@zodiac/chains'
import { randomUUID } from 'crypto'
import { prefixAddress, type Route } from 'ser-kit'
import { createMockWaypoints } from './createMockWaypoints'

export const createMockRoute = ({
  avatar = prefixAddress(Chain.ETH, ZERO_ADDRESS),
  initiator = prefixAddress(undefined, ZERO_ADDRESS),
  waypoints = createMockWaypoints(),
  ...route
}: Partial<Route> = {}): Route => ({
  id: randomUUID(),
  avatar,
  initiator,
  waypoints,

  ...route,
})
