import { Chain, ZERO_ADDRESS } from '@zodiac/chains'
import { type ExecutionRoute } from '@zodiac/schema'
import { nanoid } from 'nanoid'
import { prefixAddress } from 'ser-kit'
import { createMockWaypoints } from './createMockWaypoints'

export const createMockExecutionRoute = ({
  avatar = prefixAddress(Chain.ETH, ZERO_ADDRESS),
  waypoints = createMockWaypoints(),
  ...route
}: Partial<ExecutionRoute> = {}): ExecutionRoute => ({
  id: nanoid(),
  avatar,
  label: '',
  initiator: undefined,
  waypoints,

  ...route,
})
