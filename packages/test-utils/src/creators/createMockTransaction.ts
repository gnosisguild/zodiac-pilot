import { ZERO_ADDRESS } from '@zodiac/chains'
import type { MetaTransactionRequest } from 'ser-kit'

export const createMockTransaction = (
  transaction: Partial<MetaTransactionRequest> = {},
): MetaTransactionRequest => ({
  data: '0x',
  to: ZERO_ADDRESS,
  value: 0n,

  ...transaction,
})
