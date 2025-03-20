import type { TokenTransfer } from '@/balances-client'
import { getChain, getTokenDetails } from '@/balances-server'
import { verifyChainId, ZERO_ADDRESS } from '@zodiac/chains'
import { verifyHexAddress } from '@zodiac/schema'
import { formatUnits } from 'viem'
import type { SimulationResult } from '../types'

export const extractTokenFlowsFromSimulation = async (
  simulation: SimulationResult,
): Promise<TokenTransfer[]> => {
  const results = simulation.simulation_results ?? []

  const flowsPerResult = await Promise.all(
    results.map(async ({ transaction }) => {
      const assetChanges = transaction?.transaction_info?.asset_changes
      if (!assetChanges?.length) {
        return []
      }

      const chain = await getChain(
        verifyChainId(parseInt(transaction.network_id)),
      )

      return Promise.all(
        assetChanges.map<Promise<TokenTransfer>>(async (change) => {
          const isErc20 = change.token_info.standard === 'ERC20'

          const tokenDetails = await getTokenDetails(
            chain,
            isErc20
              ? {
                  address: verifyHexAddress(change.token_info.contract_address),
                }
              : { symbol: chain.native_token_id },
          )
          const formattedAmount = formatUnits(
            BigInt(change.raw_amount),
            tokenDetails.decimals,
          )

          return {
            ...tokenDetails,
            from:
              change.from == null
                ? ZERO_ADDRESS
                : verifyHexAddress(change.from),
            to: change.to == null ? ZERO_ADDRESS : verifyHexAddress(change.to),
            amount: formattedAmount,
          }
        }),
      )
    }),
  )
  return flowsPerResult.flat()
}
