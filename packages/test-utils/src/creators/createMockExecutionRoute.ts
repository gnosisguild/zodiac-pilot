import { Chain, ZERO_ADDRESS } from '@zodiac/chains'
import { type ExecutionRoute } from '@zodiac/schema'
import { randomUUID } from 'crypto'
import { prefixAddress } from 'ser-kit'
import { createMockWaypoints } from './createMockWaypoints'

export const createMockExecutionRoute = ({
  avatar = prefixAddress(Chain.ETH, ZERO_ADDRESS),
  waypoints = createMockWaypoints(),
  ...route
}: Partial<ExecutionRoute> = {}): ExecutionRoute => ({
  id: randomUUID(),
  avatar,
  label: '',
  initiator: undefined,
  waypoints,

  ...route,
})
