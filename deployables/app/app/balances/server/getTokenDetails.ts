import type { HexAddress } from '@zodiac/schema'
import { tokenSchema, type Chain } from '../types'
import { api } from './api'

type GetByAddressOptions = { address: HexAddress }
type GetBySymbolOptions = { symbol: string }

type GetTokenDetailOptions = GetByAddressOptions | GetBySymbolOptions

export const getTokenDetails = async (
  chain: Chain,
  options: GetTokenDetailOptions,
) => {
  const result = await api('/token', {
    schema: tokenSchema.nullable(),
    data: {
      id: 'address' in options ? options.address : options.symbol,
      chain_id: chain.id,
    },
  })
  if (!result) {
    return null
  }
  return {
    contractId: result.id,
    name: result.name,
    logoUrl: result.logo_url,
    symbol: result.optimized_symbol || result.display_symbol || result.symbol,
    usdPrice: result.price,
    decimals: result.decimals || 18,
    chain: result.chain,
  }
}
