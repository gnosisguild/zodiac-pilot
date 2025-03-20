import { verifyHexAddress, type HexAddress } from '@zodiac/schema'
import type { SimulatedTransaction } from '../types'

export type ApprovalTransaction = {
  spender: HexAddress
  tokenAddress: HexAddress
}

export const extractApprovalsFromSimulation = (
  transactions: SimulatedTransaction[],
): ApprovalTransaction[] => {
  return transactions.flatMap(({ transaction_info: { logs } }) => {
    if (!Array.isArray(logs)) {
      return []
    }

    return logs
      .filter((log) => log.name === 'Approval')
      .map((log) => ({
        tokenAddress: verifyHexAddress(log.raw.address),
        spender: verifyHexAddress(log.inputs[1].value),
      }))
  })
}
