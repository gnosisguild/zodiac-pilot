import { type UnconfirmedTransaction } from '@/state'
import { createMockTransactionRequest } from '@zodiac/test-utils'
import { nanoid } from 'nanoid'

export const createTransaction = (
  transaction: Partial<UnconfirmedTransaction> = {},
): UnconfirmedTransaction => ({
  ...createMockTransactionRequest(transaction),

  id: nanoid(),
  createdAt: new Date(),

  ...transaction,
})
