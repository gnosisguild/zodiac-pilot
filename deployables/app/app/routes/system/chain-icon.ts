import { getChain } from '@/balances-server'
import { verifyChainId } from '@zodiac/chains'
import { Route } from './+types/chain-icon'

export const loader = async ({ params }: Route.LoaderArgs) => {
  const chainId = verifyChainId(parseInt(params.chainId))

  const chain = await getChain(chainId)

  if (chain.logo_url == null) {
    return null
  }

  return await fetch(chain.logo_url)
}
