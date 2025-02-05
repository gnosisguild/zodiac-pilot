import type { HexAddress } from '@zodiac/schema'
import { formatUnits } from 'viem'
import { tokenBalancesSchema, type Chain, type TokenBalance } from '../types'
import { api } from './api'

export const getTokenBalances = async (
  chain: Chain,
  address: HexAddress,
): Promise<TokenBalance[]> => {
  const rawData = await api('/user/token_list', {
    schema: tokenBalancesSchema,
    data: {
      id: address,
      chain_id: chain.id,
      is_all: false,
    },
  })

  return rawData
    .map((data) => ({
      contractId: data.id,
      name: data.name,
      amount: formatUnits(BigInt(data.raw_amount), data.decimals || 18),
      logoUrl: data.logo_url,
      symbol: data.optimized_symbol || data.display_symbol || data.symbol,
      usdValue: data.amount * data.price,
      usdPrice: data.price,
      decimals: data.decimals || 18,
      chain: data.chain,
    }))
    .toSorted((a, b) => {
      if (a.contractId === chain.native_token_id) {
        return -1
      }

      return b.usdValue - a.usdValue
    })
}
