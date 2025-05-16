import type { ConfirmedTransaction, Transaction } from './state'

export const isConfirmedTransaction = (
  transaction: Transaction,
): transaction is ConfirmedTransaction => 'snapshotId' in transaction
