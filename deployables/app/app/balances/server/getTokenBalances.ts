import type { ChainId } from '@zodiac/chains'
import type { HexAddress } from '@zodiac/schema'
import { formatUnits } from 'viem'
import { tokenListSchema, type TokenBalance } from '../types'
import { api } from './api'
import { getDeBankChainId } from './getDeBankChainId'

export const getTokenBalances = async (
  chainId: ChainId,
  address: HexAddress,
): Promise<TokenBalance[]> => {
  const rawData = await api('/user/token_list', {
    schema: tokenListSchema,
    data: {
      id: address,
      chain_id: await getDeBankChainId(chainId),
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
    }))
    .toSorted((a, b) => b.usdValue - a.usdValue)
}
