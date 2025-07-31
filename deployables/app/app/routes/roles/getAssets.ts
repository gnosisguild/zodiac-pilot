import { ChainId, isEnabledChain, verifyChainId } from '@zodiac/chains'
import {
  addressSchema,
  chainIdSchema,
  prefixedAddressSchema,
} from '@zodiac/schema'
import { prefixAddress, PrefixedAddress } from 'ser-kit'
import z from 'zod'

const tokenSchema = z.object({
  chainId: z.number(),
  name: z.string(),
  symbol: z.string(),
  logoURI: z.url(),
  address: addressSchema,
})

const _refinedTokenSchema = tokenSchema.extend({
  chainId: chainIdSchema,
  address: prefixedAddressSchema,
})

const assetSchema = z.object({
  tokens: z.array(tokenSchema),
})

const getAllAssets = async () => {
  const response = await fetch('https://ipfs.io/ipns/tokens.uniswap.org')
  const json = await response.json()

  const { tokens } = assetSchema.parse(json)

  return tokens
    .filter(({ chainId }) => isEnabledChain(chainId))
    .map((token) => {
      const verifiedChainId = verifyChainId(token.chainId)

      return {
        name: token.name,
        symbol: token.symbol,
        logoURI: token.logoURI,
        chainId: verifiedChainId,
        address: prefixAddress(verifiedChainId, token.address),
      }
    })
}

export const getAssets = async (chainIds: ChainId[]) => {
  const assets = await getAllAssets()

  return assets.reduce<
    Record<PrefixedAddress, z.infer<typeof _refinedTokenSchema>>
  >((result, token) => {
    if (!chainIds.includes(token.chainId)) {
      return result
    }

    return { ...result, [token.address]: token }
  }, {})
}

export const getVerifiedAssets = async (addresses: PrefixedAddress[]) => {
  const assets = await getAllAssets()

  return assets.filter((asset) => addresses.includes(asset.address))
}
