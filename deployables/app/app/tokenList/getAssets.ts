import { ChainId } from '@zodiac/chains'
import { PrefixedAddress } from '@zodiac/schema'
import { getAllAssets } from './getAllAssets'
import { Token } from './schema'

export const getAssets = async (chainIds: ChainId[]) => {
  const assets = await getAllAssets()

  return assets.reduce<Record<PrefixedAddress, Token>>((result, token) => {
    if (!chainIds.includes(token.chainId)) {
      return result
    }

    return { ...result, [token.address]: token }
  }, {})
}
