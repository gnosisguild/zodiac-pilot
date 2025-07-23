import type { SimulatedTransaction } from '@/simulation-server'
import { Chain } from '@zodiac/chains'

export const createMockSimulatedTransaction = (
  transaction: Partial<SimulatedTransaction> = {},
): SimulatedTransaction => ({
  network_id: Chain.ETH.toString(),
  transaction_info: { logs: null },

  ...transaction,
})
