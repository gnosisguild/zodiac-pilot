import { getTokens } from './getTokens'

export async function getTokenByAddress(chain: string, tokenId: string) {
  const tokens = await getTokens(chain, [tokenId])
  if (tokens.length === 0) {
    return null
  }
  return tokens[0]
}
