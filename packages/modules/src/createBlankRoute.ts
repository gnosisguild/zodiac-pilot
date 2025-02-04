import { Chain, ZERO_ADDRESS } from '@zodiac/chains'
import type { ExecutionRoute } from '@zodiac/schema'
import { nanoid } from 'nanoid'
import { prefixAddress } from 'ser-kit'
import { createEoaStartingPoint } from './createEoaStartingPoint'

export const createBlankRoute = (): ExecutionRoute => ({
  id: nanoid(),
  avatar: prefixAddress(Chain.ETH, ZERO_ADDRESS),
  label: '',
  waypoints: [createEoaStartingPoint({ address: ZERO_ADDRESS })],
})
