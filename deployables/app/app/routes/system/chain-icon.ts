import { getChain } from '@/balances-server'
import { verifyChainId } from '@zodiac/chains'
import { Route } from './+types/chain-icon'

export const loader = async ({ params }: Route.LoaderArgs) => {
  const chainId = verifyChainId(parseInt(params.chainId))

  try {
    const chain = await getChain(chainId)

    if (chain.logo_url == null) {
      return null
    }

    const response = await fetch(chain.logo_url)

    return new Response(response.body, {
      headers: {
        ['Cache-Control']:
          'public, max-age=604800, stale-while-revalidate=86400',
      },
    })
  } catch {
    return null
  }
}
