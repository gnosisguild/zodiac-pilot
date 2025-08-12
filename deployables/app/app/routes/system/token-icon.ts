import { getVerifiedTokens } from '@/token-list'
import { verifyPrefixedAddress } from '@zodiac/schema'
import { Route } from './+types/token-icon'

export const loader = async ({
  params: { prefixedAddress },
}: Route.LoaderArgs) => {
  const [token] = await getVerifiedTokens([
    verifyPrefixedAddress(prefixedAddress),
  ])

  return await fetch(token.logoURI)
}
