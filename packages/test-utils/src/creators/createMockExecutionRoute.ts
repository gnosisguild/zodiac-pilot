import { type ExecutionRoute } from '@zodiac/schema'
import { randomUUID } from 'crypto'
import { formatPrefixedAddress } from 'ser-kit'
import { randomHex } from './randomHex'

export const createMockExecutionRoute = (
  route: Partial<ExecutionRoute> = {},
): ExecutionRoute => ({
  id: randomUUID(),
  avatar: formatPrefixedAddress(1, randomHex(40)),
  label: '',
  initiator: undefined,

  ...route,
})
