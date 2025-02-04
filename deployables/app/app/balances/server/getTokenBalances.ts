import { invariantResponse } from '@epic-web/invariant'
import type { ChainId } from '@zodiac/chains'
import { getDeBankApiKey } from '@zodiac/env'
import type { HexAddress } from '@zodiac/schema'
import { chains } from 'ser-kit'
import { formatUnits } from 'viem'
import { tokenListSchema, type TokenBalance } from '../types'

export const getTokenBalances = async (
  chainId: ChainId,
  address: HexAddress,
): Promise<TokenBalance[]> => {
  const endpoint = new URL(
    '/v1/user/token_list',
    'https://pro-openapi.debank.com',
  )

  const chain = chains.find((chain) => chain.chainId === chainId)

  invariantResponse(chain != null, `Could not find chain with ID "${chainId}"`)

  endpoint.searchParams.set('id', address)
  endpoint.searchParams.set('chain_id', chain.shortName)
  endpoint.searchParams.set('is_all', 'false')

  const response = await fetch(endpoint, {
    headers: { AccessKey: getDeBankApiKey() },
  })

  const rawData = tokenListSchema.parse(await response.json())

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
