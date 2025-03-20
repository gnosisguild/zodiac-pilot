import { getChainId } from '@zodiac/chains'
import {
  unprefixAddress,
  type MetaTransactionRequest,
  type PrefixedAddress,
} from 'ser-kit'
import { simulationResultSchema } from '../types'
import { api } from './api'
import {
  extractApprovalsFromSimulation,
  type ApprovalTransaction,
} from './extractApprovalsFromSimulation'
import { extractTokenFlowsFromSimulation } from './extractTokenFlowsFromSimulation'
import { splitTokenFlows, type TokenFlows } from './splitTokenFlows'

type Simulation = {
  tokenFlows: TokenFlows
  approvalTransactions: ApprovalTransaction[]
}

type SimulationOptions = {
  omitTokenFlows?: boolean
}

export const simulateTransactionBundle = async (
  avatar: PrefixedAddress,
  transactions: MetaTransactionRequest[],
  { omitTokenFlows = false }: SimulationOptions = {},
): Promise<Simulation> => {
  const chainId = getChainId(avatar)
  const from = unprefixAddress(avatar)

  const result = await api('/simulate-bundle', {
    schema: simulationResultSchema,
    method: 'POST',
    body: {
      simulations: transactions.map(({ to, data, value }) => ({
        network_id: chainId,
        from,
        to,
        input: data,
        value: value.toString(),
        save: true,
        save_if_fails: true,
        simulation_type: 'full',
      })),
    },
  })

  const simulatedTransactions = result.simulation_results.map(
    ({ transaction }) => transaction,
  )

  return {
    tokenFlows: omitTokenFlows
      ? { sent: [], received: [], other: [] }
      : splitTokenFlows(
          await extractTokenFlowsFromSimulation(simulatedTransactions),
          from,
        ),
    approvalTransactions: extractApprovalsFromSimulation(simulatedTransactions),
  }
}
