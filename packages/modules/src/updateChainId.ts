import type { ChainId } from '@zodiac/chains'
import type { ExecutionRoute } from '@zodiac/schema'
import { formatPrefixedAddress, splitPrefixedAddress } from 'ser-kit'

export const updateChainId = (
  route: ExecutionRoute,
  chainId: ChainId,
): ExecutionRoute => {
  const [, address] = splitPrefixedAddress(route.avatar)

  return {
    ...route,
    avatar: formatPrefixedAddress(chainId, address),
  }
}
