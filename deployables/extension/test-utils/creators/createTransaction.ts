import { ExecutionStatus, type TransactionState } from '@/state'
import { ZERO_ADDRESS } from '@zodiac/chains'
import { createMockTransaction } from '@zodiac/test-utils'
import { nanoid } from 'nanoid'

export const createTransaction = (
  transaction: Partial<TransactionState> = {},
): TransactionState => ({
  id: nanoid(),
  contractInfo: { address: ZERO_ADDRESS, verified: true },
  status: ExecutionStatus.PENDING,
  transaction: createMockTransaction(transaction.transaction),

  ...transaction,
})
