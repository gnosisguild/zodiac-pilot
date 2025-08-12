import { PrefixedAddress } from '@zodiac/schema'
import { getAllTokens } from './getAllTokens'

export const getVerifiedTokens = async (addresses: PrefixedAddress[]) => {
  const tokens = await getAllTokens()

  return tokens.filter((token) => addresses.includes(token.address))
}
