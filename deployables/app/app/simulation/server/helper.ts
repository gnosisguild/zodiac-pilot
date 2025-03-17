import type { TokenTransfer } from '@/balances-client'
import { getChain, getTokenDetails } from '@/balances-server'
import { verifyChainId } from '@zodiac/chains'
import type { HexAddress } from '@zodiac/schema'
import { ZeroAddress } from 'ethers'
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

      const chainId = parseInt(transaction.network_id)
      const chain = await getChain(verifyChainId(chainId))

      return Promise.all(
        assetChanges.map(async (change) => {
          const isErc20 = change.token_info.standard === 'ERC20'
          const tokenAddress = isErc20
            ? change.token_info.contract_address
            : change.token_info.symbol

          const tokenDetails = await getTokenDetails(
            chain,
            tokenAddress as HexAddress,
          )
          const formattedAmount = formatUnits(
            BigInt(change.raw_amount),
            tokenDetails.decimals,
          )

          return {
            ...tokenDetails,
            from: change.from ?? ZeroAddress,
            to: change.to ?? ZeroAddress,
            token: tokenAddress,
            amount: formattedAmount,
          } as TokenTransfer
        }),
      )
    }),
  )
  return flowsPerResult.flat()
}

export const splitTokenFlows = (flows: TokenTransfer[], address: string) => {
  const addrLower = address.toLowerCase()
  return {
    sent: flows.filter((f) => f.from.toLowerCase() === addrLower),
    received: flows.filter((f) => f.to.toLowerCase() === addrLower),
    other: flows.filter(
      (f) =>
        f.from.toLowerCase() !== addrLower && f.to.toLowerCase() !== addrLower,
    ),
  }
}
