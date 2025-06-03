import { saveStorageEntry } from '@/storage'
import type { ConfirmedTransaction } from './state'

export const saveLastTransactionExecutedAt = (
  transaction: ConfirmedTransaction,
) =>
  saveStorageEntry({
    key: 'lastTransactionExecutedAt',
    value: transaction.executedAt.toISOString(),
  })
