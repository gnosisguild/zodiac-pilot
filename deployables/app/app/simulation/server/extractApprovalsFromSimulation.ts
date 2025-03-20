import type { HexAddress } from '@zodiac/schema'
import type { SimulationResult } from '../types'

export const extractApprovalsFromSimulation = (
  simulation: SimulationResult,
): { spender: HexAddress; tokenAddress: HexAddress }[] => {
  return (simulation.simulation_results ?? []).flatMap(({ transaction }) => {
    const logs = transaction?.transaction_info?.logs
    if (!Array.isArray(logs)) return []

    return logs
      .filter((log) => log.name === 'Approval')
      .map((log) => ({
        tokenAddress: log.raw.address.toLowerCase(),
        spender: log.inputs[1].value,
      }))
  })
}
