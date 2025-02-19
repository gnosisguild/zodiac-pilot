import { Chain, ZERO_ADDRESS } from '@zodiac/chains'
import type { Waypoints } from '@zodiac/schema'
import { randomUUID } from 'crypto'
import { prefixAddress, type Route } from 'ser-kit'
import { createMockWaypoints } from './createMockWaypoints'

export const createMockRoute = ({
  avatar = prefixAddress(Chain.ETH, ZERO_ADDRESS),
  initiator = prefixAddress(undefined, ZERO_ADDRESS),
  waypoints = createMockWaypoints(),
  ...route
}: Partial<
  Omit<Route, 'waypoints'> & { waypoints: Waypoints }
> = {}): Route => ({
  id: randomUUID(),
  avatar,
  initiator,
  // @ts-expect-error some weird type stuff that should not matter
  waypoints,

  ...route,
})
