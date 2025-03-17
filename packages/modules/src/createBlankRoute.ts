import { Chain, ZERO_ADDRESS } from '@zodiac/chains'
import type { ExecutionRoute } from '@zodiac/schema'
import { prefixAddress } from 'ser-kit'
import { createEoaStartingPoint } from './createEoaStartingPoint'
import { createRouteId } from './createRouteId'

export const createBlankRoute = (): ExecutionRoute => ({
  id: createRouteId(),
  avatar: prefixAddress(Chain.ETH, ZERO_ADDRESS),
  label: '',
  waypoints: [createEoaStartingPoint({ address: ZERO_ADDRESS })],
})
