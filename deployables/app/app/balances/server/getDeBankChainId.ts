import { invariantResponse } from '@epic-web/invariant'
import type { ChainId } from 'ser-kit'
import { chainListSchema } from '../types'
import { api } from './api'

export const getDeBankChainId = async (chainId: ChainId) => {
  const chains = await api('/chain/list', { schema: chainListSchema })

  const chain = chains.find((chain) => chain.community_id === chainId)

  invariantResponse(
    chain != null,
    `Could not find a chain on DeBank with community_id "${chainId}"`,
  )

  return chain.id
}
