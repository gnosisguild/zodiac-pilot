import type { HexAddress } from '@zodiac/schema'
import { tokenSchema, type Chain, type TokenBalance } from '../types'
import { api } from './api'

type GetByAddressOptions = { address: HexAddress }
type GetBySymbolOptions = { symbol: string }

type GetTokenDetailOptions = GetByAddressOptions | GetBySymbolOptions

export const getTokenDetails = async (
  chain: Chain,
  options: GetTokenDetailOptions,
): Promise<TokenBalance> => {
  const rawData = await api('/token', {
    schema: tokenSchema,
    data: {
      id: 'address' in options ? options.address : options.symbol,
      chain_id: chain.id,
    },
  })

  return {
    contractId: rawData.id,
    name: rawData.name,
    amount: '',
    logoUrl: rawData.logo_url,
    symbol:
      rawData.optimized_symbol || rawData.display_symbol || rawData.symbol,
    usdValue: 0,
    usdPrice: rawData.price,
    decimals: rawData.decimals || 18,
    chain: rawData.chain,
  }
}
