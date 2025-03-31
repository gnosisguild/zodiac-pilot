export type { SimulatedTransaction } from '../types'
export type {
  ApprovalLog,
  Approval as ApprovalTransaction,
} from './extractApprovalsFromSimulation'

export { simulateTransactionBundle } from './simulateTransactionBundle'
