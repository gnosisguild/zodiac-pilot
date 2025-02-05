import { invariantResponse } from '@epic-web/invariant'
import type { ChainId } from '@zodiac/chains'
import { getAvailableChains } from './getAvailableChains'

export const getChain = async (chainId: ChainId) => {
  const chains = await getAvailableChains()

  const chain = chains.find((chain) => chain.community_id === chainId)

  invariantResponse(
    chain != null,
    `Could not find a chain on DeBank with community_id "${chainId}"`,
  )

  return chain
}
