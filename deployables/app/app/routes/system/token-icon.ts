import { getChain, getTokenDetails } from '@/balances-server'
import { getVerifiedTokens } from '@/token-list'
import { getChainId } from '@zodiac/chains'
import { verifyPrefixedAddress } from '@zodiac/schema'
import { unprefixAddress } from 'ser-kit'
import { Route } from './+types/token-icon'

export const loader = async ({
  params: { prefixedAddress },
}: Route.LoaderArgs) => {
  const verifiedAddress = verifyPrefixedAddress(prefixedAddress)

  const [token] = await getVerifiedTokens([verifiedAddress])

  if (token == null) {
    const chain = await getChain(getChainId(verifiedAddress))
    const details = await getTokenDetails(chain, {
      address: unprefixAddress(verifiedAddress),
    })

    if (details == null || details.logoUrl == null) {
      return null
    }

    const response = await fetch(details.logoUrl)

    return new Response(response.body, {
      headers: {
        ['Cache-Control']:
          'public, max-age=604800, stale-while-revalidate=86400',
      },
    })
  }

  const response = await fetch(token.logoURI)

  return new Response(response.body, {
    headers: {
      ['Cache-Control']: 'public, max-age=604800, stale-while-revalidate=86400',
    },
  })
}
