import { encodeSingle } from 'react-multisend'
import { TransactionState } from './state'

export const encodeTransaction = (transaction: TransactionState) => {
  return {
    ...encodeSingle(transaction.input),
    operation: transaction.isDelegateCall ? 1 : 0,
  }
}
