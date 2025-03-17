import type { TokenTransfer } from '@/balances-client'
import { getChain, getTokenDetails } from '@/balances-server'
import { verifyChainId } from '@zodiac/chains'
import type { HexAddress, MetaTransactionRequest } from '@zodiac/schema'
import { ZeroAddress } from 'ethers'
import { formatUnits } from 'viem'
import type { SimulationParams, SimulationResult } from '../types'

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

export const extractApprovalsFromSimulation = (
  simulation: SimulationResult,
): { spender: HexAddress; tokenAddress: HexAddress }[] => {
  return (simulation.simulation_results ?? []).flatMap(({ transaction }) => {
    const logs = transaction?.transaction_info?.logs
    if (!Array.isArray(logs)) return []

    return logs
      .filter((log) => log.name === 'Approval')
      .map((log) => ({
        tokenAddress: log.raw.address.toLowerCase() as HexAddress,
        spender: log.inputs[1].value as HexAddress,
      }))
  })
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

export const buildSimulationParams = (
  chainId: number,
  avatarAddress: string,
  metaTxs: MetaTransactionRequest[],
): SimulationParams[] => {
  return metaTxs.map(
    (tx) =>
      ({
        network_id: chainId,
        from: avatarAddress,
        to: tx.to,
        input: tx.data,
        value: tx.value.toString(),
        save: true,
        save_if_fails: true,
        simulation_type: 'full',
      }) as SimulationParams,
  )
}
