import { isEnabledChain, verifyChainId } from '@zodiac/chains'
import { prefixAddress } from 'ser-kit'
import { assetSchema } from './schema'

export const getAllTokens = async () => {
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
