import { ExecutionStatus, type TransactionState } from '@/state'
import { ZERO_ADDRESS } from '@zodiac/chains'
import { nanoid } from 'nanoid'

export const createTransaction = (
  transaction: Partial<TransactionState> = {},
): TransactionState => ({
  id: nanoid(),
  contractInfo: { address: ZERO_ADDRESS, verified: true },
  status: ExecutionStatus.PENDING,
  transaction: {
    data: '0x0',
    to: ZERO_ADDRESS,
    value: 0n,
  },

  ...transaction,
})
