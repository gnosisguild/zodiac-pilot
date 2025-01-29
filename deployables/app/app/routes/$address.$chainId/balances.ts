import { getTokenBalances, type BalanceResult } from '@/balances'
import { verifyChainId } from '@zodiac/chains'
import { verifyHexAddress } from '@zodiac/schema'
import type { Route } from './+types/balances'

export const loader = async ({
  params,
}: Route.LoaderArgs): Promise<BalanceResult> => {
  const { chainId, address } = params

  return getTokenBalances(
    verifyChainId(parseInt(chainId)),
    verifyHexAddress(address),
  )
}
