import {
  getChain,
  getTokenBalances,
  type TokenBalance,
} from '@/balances-server'
import { applyDeltaToBalances, getVnetTransactionDelta } from '@/vnet-server'
import { invariantResponse } from '@epic-web/invariant'
import { verifyChainId } from '@zodiac/chains'
import { verifyHexAddress } from '@zodiac/schema'
import { getAddress } from 'viem'
import type { Route } from './+types/balances'

export const loader = async ({
  request,
  params: { chainId, address },
}: Route.LoaderArgs): Promise<TokenBalance[]> => {
  const url = new URL(request.url)

  const chain = await getChain(verifyChainId(parseInt(chainId)))
  let allBalances = []
  const mainNetBalances = await getTokenBalances(
    chain,
    verifyHexAddress(address),
  )
  allBalances = mainNetBalances
  if (url.searchParams.has('fork')) {
    const fork = url.searchParams.get('fork')

    invariantResponse(fork != null, `Fork param was no URL`)
    const vnetId = url.searchParams.get('vnetId')
    invariantResponse(vnetId != null, `vnetId param was no URL`)
    if (vnetId) {
      const deltas = await getVnetTransactionDelta(
        vnetId,
        fork,
        getAddress(address),
      )
      if (deltas) {
        allBalances = await applyDeltaToBalances(
          mainNetBalances,
          deltas,
          chain.id,
        )
      }
    }

    return allBalances
  }

  return mainNetBalances
}
