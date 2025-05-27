import { ExecutionStatus, type ConfirmedTransaction } from '@/transactions'
import { randomHex } from '@zodiac/test-utils'
import { randomUUID } from 'crypto'
import { createTransaction } from './createTransaction'

export const createConfirmedTransaction = (
  transaction: Partial<ConfirmedTransaction> = {},
): ConfirmedTransaction => ({
  ...createTransaction(transaction),

  transactionHash: randomHex(),
  snapshotId: randomUUID(),
  executedAt: new Date(),
  status: ExecutionStatus.CONFIRMED,

  ...transaction,
})
