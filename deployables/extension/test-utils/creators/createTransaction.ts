import { type Transaction } from '@/state'
import { ZERO_ADDRESS } from '@zodiac/chains'
import { createMockTransactionRequest } from '@zodiac/test-utils'
import { nanoid } from 'nanoid'

export const createTransaction = (
  transaction: Partial<Transaction> = {},
): Transaction => ({
  id: nanoid(),
  contractInfo: { address: ZERO_ADDRESS, verified: true },
  createdAt: new Date(),

  ...createMockTransactionRequest(transaction),
  ...transaction,
})
