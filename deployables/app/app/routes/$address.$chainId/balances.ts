import {
  getChain,
  getTokenBalances,
  type TokenBalance,
} from '@/balances-server'
import {
  applyDeltaToBalances,
  getVnetErc20Deltas,
  getVnetNativeDelta,
} from '@/vnet-server'
import { invariantResponse } from '@epic-web/invariant'
import { verifyChainId } from '@zodiac/chains'
import { verifyHexAddress } from '@zodiac/schema'
import type { Route } from './+types/balances'

export const loader = async ({
  request,
  params: { chainId, address },
}: Route.LoaderArgs): Promise<TokenBalance[]> => {
  const url = new URL(request.url)

  const chain = await getChain(verifyChainId(parseInt(chainId)))

  let balances = await getTokenBalances(chain, verifyHexAddress(address))

  if (url.searchParams.has('fork')) {
    const fork = url.searchParams.get('fork')
    invariantResponse(fork != null, `Fork param was no URL`)

    const vnetId = url.searchParams.get('vnetId')
    invariantResponse(vnetId != null, 'vnetId is required')

    const erc20Deltas = await getVnetErc20Deltas(
      vnetId,
      fork,
      verifyHexAddress(address),
    )

    const nativeDelta = await getVnetNativeDelta(
      fork,
      verifyHexAddress(address),
      chain.native_token_id,
      balances,
    )

    balances = await applyDeltaToBalances(
      balances,
      { ...nativeDelta, ...erc20Deltas },
      chain.id,
    )
  }

  return balances.toSorted((a, b) => {
    if (a.contractId === chain.native_token_id) {
      return -1
    }

    if (a.usdValue != null && b.usdValue != null) {
      return b.usdValue - a.usdValue
    }

    if (a.usdValue == null && b.usdValue != null) {
      return -1
    }

    if (a.usdPrice != null && b.usdValue == null) {
      return 1
    }

    return 0
  })
}
