import { ExecutionStatus, type ConfirmedTransaction } from '@/state'
import { randomHex } from '@zodiac/test-utils'
import { randomUUID } from 'crypto'
import { createTransaction } from './createTransaction'

export const createConfirmedTransaction = (
  transaction: Partial<ConfirmedTransaction> = {},
): ConfirmedTransaction => ({
  ...createTransaction(transaction),

  transactionHash: randomHex(),
  snapshotId: randomUUID(),
  status: ExecutionStatus.CONFIRMED,

  ...transaction,
})
