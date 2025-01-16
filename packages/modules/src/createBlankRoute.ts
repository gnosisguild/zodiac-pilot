import { Chain, ZERO_ADDRESS } from '@zodiac/chains'
import type { ExecutionRoute } from '@zodiac/schema'
import { nanoid } from 'nanoid'
import { formatPrefixedAddress } from 'ser-kit'
import { createEoaStartingPoint } from './createEoaStartingPoint'

export const createBlankRoute = (): ExecutionRoute => ({
  id: nanoid(),
  avatar: formatPrefixedAddress(Chain.ETH, ZERO_ADDRESS),
  label: '',
  waypoints: [
    createEoaStartingPoint({ chainId: Chain.ETH, address: ZERO_ADDRESS }),
  ],
})
