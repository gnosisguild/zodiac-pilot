import { getTokenBalances, type TokenBalance } from '@/balances-server'
import { invariantResponse } from '@epic-web/invariant'
import { verifyChainId } from '@zodiac/chains'
import { verifyHexAddress } from '@zodiac/schema'
import { createPublicClient, erc20Abi, formatUnits, http } from 'viem'
import type { Route } from './+types/balances'

export const loader = async ({
  request,
  params: { chainId, address },
}: Route.LoaderArgs): Promise<TokenBalance[]> => {
  const url = new URL(request.url)

  const mainNetBalances = await getTokenBalances(
    verifyChainId(parseInt(chainId)),
    verifyHexAddress(address),
  )

  if (url.searchParams.has('fork')) {
    const fork = url.searchParams.get('fork')

    invariantResponse(fork != null, `Fork param was no URL`)

    const client = createPublicClient({
      transport: http(fork),
    })

    return Promise.all(
      mainNetBalances.map(async (balance) => {
        if (balance.contractId === 'eth') {
          // todo: handle default eth
          return balance
        }

        const forkBalance = await client.readContract({
          address: balance.contractId,
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [address],
        })

        const amount = formatUnits(BigInt(forkBalance), balance.decimals)

        return {
          ...balance,

          amount,
          usdValue: parseFloat(amount) * balance.usdPrice,
        }
      }),
    )
  }

  return mainNetBalances
}
