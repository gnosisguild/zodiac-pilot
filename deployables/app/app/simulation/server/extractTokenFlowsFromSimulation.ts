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
      if (!assetChanges) {
        return []
      }
      const chain = await getChain(verifyChainId(parseInt(network_id)))
      return Promise.all(
        assetChanges.map<Promise<TokenTransfer | null>>(async (change) => {
          const isErc20 = change.token_info.standard === 'ERC20'
          let tokenDetails
          try {
            tokenDetails = await getTokenDetails(
              chain,
              isErc20
                ? {
                    address: verifyHexAddress(
                      change.token_info.contract_address,
                    ),
                  }
                : { symbol: chain.native_token_id },
            )
          } catch (error) {
            console.error('Error fetching token details:', error)
            return null
          }
          if (!tokenDetails) {
            return null
          }
          const formattedAmount = formatUnits(
            BigInt(change.raw_amount),
            tokenDetails.decimals,
          ) as `${number}`
          return {
            ...tokenDetails,
            from:
              change.from == null
                ? ZERO_ADDRESS
                : verifyHexAddress(change.from),
            to: change.to == null ? ZERO_ADDRESS : verifyHexAddress(change.to),
            amount: formattedAmount,
            usdValue:
              parseFloat(formattedAmount) * (tokenDetails.usdPrice || 0),
          }
        }),
      )
    }),
  )
  return flowsPerResult
    .flat()
    .filter((flow): flow is TokenTransfer => flow !== null)
}
