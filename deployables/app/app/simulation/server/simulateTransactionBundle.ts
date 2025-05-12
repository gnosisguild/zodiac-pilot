import * as Sentry from '@sentry/react-router'
import { getChainId } from '@zodiac/chains'
import {
  unprefixAddress,
  type MetaTransactionRequest,
  type PrefixedAddress,
} from 'ser-kit'
import { simulationResultSchema, type SimulatedTransaction } from '../types'
import { api } from './api'
import {
  extractApprovalsFromSimulation,
  type Approval,
} from './extractApprovalsFromSimulation'
import { extractTokenFlowsFromSimulation } from './extractTokenFlowsFromSimulation'
import { splitTokenFlows, type TokenFlows } from './splitTokenFlows'

type Simulation = {
  error: unknown | null
  tokenFlows: TokenFlows
  approvals: Approval[]
}

type SimulationOptions = {
  omitTokenFlows?: boolean
}

export const simulateTransactionBundle = async (
  avatar: PrefixedAddress,
  transactions: MetaTransactionRequest[],
  { omitTokenFlows = false }: SimulationOptions = {},
): Promise<Simulation> => {
  try {
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

    const simulatedTransactions = result.simulation_results.reduce<
      SimulatedTransaction[]
    >((result, { transaction }) => {
      if (transaction == null) {
        return result
      }

      return [...result, transaction]
    }, [])

    return {
      error: null,
      tokenFlows: omitTokenFlows
        ? { sent: [], received: [], other: [] }
        : splitTokenFlows(
            await extractTokenFlowsFromSimulation(simulatedTransactions),
            from,
          ),
      approvals: await extractApprovalsFromSimulation(simulatedTransactions),
    }
  } catch (error) {
    console.error(error)
    Sentry.captureException(error)

    return {
      error,
      tokenFlows: { sent: [], received: [], other: [] },
      approvals: [],
    }
  }
}
