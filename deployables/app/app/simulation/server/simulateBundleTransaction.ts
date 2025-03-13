import { simulationResultSchema, type SimulationParams } from '../types'
import { api } from './api'

export const simulateBundleTransaction = async (
  simulateData: SimulationParams[],
) => {
  return api('/simulate-bundle', {
    schema: simulationResultSchema,
    method: 'POST',
    body: {
      simulations: simulateData,
    },
  })
}
