import { tokenSchema, type Chain, type TokenBalance } from '../types'
import { api } from './api'

export const getTokenDetails = async (
  chain: Chain,
  address: string,
): Promise<TokenBalance> => {
  const rawData = await api('/token', {
    schema: tokenSchema,
    data: {
      id: address,
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
