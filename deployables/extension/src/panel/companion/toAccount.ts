import type { ExecutionRoute } from '@/types'
import { getChainId } from '@zodiac/chains'
import { unprefixAddress } from 'ser-kit'
import type { PartialAccount } from './PartialAccount'

export const toAccount = (route: ExecutionRoute): PartialAccount => ({
  id: route.id,
  chainId: getChainId(route.avatar),
  address: unprefixAddress(route.avatar),
  label: route.label ?? null,
})
