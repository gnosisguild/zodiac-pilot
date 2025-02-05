import { tokensSchema } from '../types'
import { api } from './api'

export const isValidToken = async (chain: string, tokenId: string) => {
  const tokens = await api('/token/list_by_ids', {
    schema: tokensSchema,
    data: { chain_id: chain, ids: [tokenId] },
  })

  return tokens.length !== 0
}
