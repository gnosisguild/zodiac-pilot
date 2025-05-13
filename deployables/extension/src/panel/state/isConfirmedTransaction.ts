import type { ConfirmedTransaction, Transaction } from './reducer'

export const isConfirmedTransaction = (
  transaction: Transaction,
): transaction is ConfirmedTransaction => 'snapshotId' in transaction
