import { ChainId } from '@zodiac/chains'
import { PrefixedAddress } from '@zodiac/schema'
import { getAllTokens } from './getAllTokens'
import { Token } from './schema'

export type Tokens = Record<PrefixedAddress, Token>

export const getTokens = async (chainIds: ChainId[]) => {
  const assets = await getAllTokens()

  return assets.reduce<Tokens>((result, token) => {
    if (!chainIds.includes(token.chainId)) {
      return result
    }

    return { ...result, [token.address]: token }
  }, {})
}
