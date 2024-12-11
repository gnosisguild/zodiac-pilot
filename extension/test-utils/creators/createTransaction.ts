import { ZERO_ADDRESS } from '@/chains'
import { ExecutionStatus, type TransactionState } from '@/state'
import { nanoid } from 'nanoid'

export const createTransaction = (
  transaction: Partial<TransactionState> = {},
): TransactionState => ({
  id: nanoid(),
  contractInfo: { address: ZERO_ADDRESS, verified: true },
  status: ExecutionStatus.PENDING,
  transaction: {
    data: '',
    to: ZERO_ADDRESS,
    value: '',
  },

  ...transaction,
})
