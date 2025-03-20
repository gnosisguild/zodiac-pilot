import type { TokenTransfer } from '@/balances-client'
import { getChain, getTokenDetails } from '@/balances-server'
import { verifyChainId, ZERO_ADDRESS } from '@zodiac/chains'
import { verifyHexAddress } from '@zodiac/schema'
import { formatUnits } from 'viem'
import type { SimulatedTransaction } from '../types'

export const extractTokenFlowsFromSimulation = async (
  transactions: SimulatedTransaction[],
): Promise<TokenTransfer[]> => {
  const flowsPerResult = await Promise.all(
    transactions.map(async ({ transaction_info, network_id }) => {
      const assetChanges = transaction_info.asset_changes
      if (!assetChanges?.length) {
        return []
      }

      const chain = await getChain(verifyChainId(parseInt(network_id)))

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
