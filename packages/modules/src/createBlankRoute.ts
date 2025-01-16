import { Chain, ZERO_ADDRESS } from '@zodiac/chains'
import type { ExecutionRoute } from '@zodiac/schema'
import { nanoid } from 'nanoid'
import { formatPrefixedAddress } from 'ser-kit'

export const createBlankRoute = (): ExecutionRoute => ({
  id: nanoid(),
  avatar: formatPrefixedAddress(Chain.ETH, ZERO_ADDRESS),
  label: '',
})
