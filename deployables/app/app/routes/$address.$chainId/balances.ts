import {
  getChain,
  getTokenBalances,
  type TokenBalance,
} from '@/balances-server'
import { applyDeltaToBalances, getVnetTransactionDelta } from '@/vnet-server'
import { invariantResponse } from '@epic-web/invariant'
import { verifyChainId } from '@zodiac/chains'
import { verifyHexAddress, type HexAddress } from '@zodiac/schema'
import { erc20Abi, type PublicClient } from 'viem'
import type { Route } from './+types/balances'

export const loader = async ({
  request,
  params: { chainId, address },
}: Route.LoaderArgs): Promise<TokenBalance[]> => {
  const url = new URL(request.url)

  const chain = await getChain(verifyChainId(parseInt(chainId)))

  const allBalances = await getTokenBalances(chain, verifyHexAddress(address))

  if (url.searchParams.has('fork')) {
    const fork = url.searchParams.get('fork')

    invariantResponse(fork != null, `Fork param was no URL`)

    const vnetId = url.searchParams.get('vnetId')

    if (vnetId) {
      const deltas = await getVnetTransactionDelta(
        vnetId,
        fork,
        verifyHexAddress(address),
        allBalances,
        chain.id,
      )

      return await applyDeltaToBalances(allBalances, deltas, chain.id)
    }
  }

  return allBalances
}

type GetForkBalanceOptions = {
  address: HexAddress
  contractId: string
  nativeChainId: string
}

const getForkBalance = (
  client: PublicClient,
  { contractId, address, nativeChainId }: GetForkBalanceOptions,
): Promise<bigint> => {
  if (contractId === nativeChainId) {
    return client.getBalance({ address })
  }

  return client.readContract({
    address: contractId,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address],
  })
}
