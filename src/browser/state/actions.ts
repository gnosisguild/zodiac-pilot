import { TransactionInput } from 'react-multisend'

interface AppendRawTransactionAction {
  type: 'APPEND_RAW_TRANSACTION'
  payload: TransactionInput
}
interface DecodeTransactionAction {
  type: 'DECODE_TRANSACTION'
  payload: TransactionInput
}

interface ConfirmTransactionAction {
  type: 'CONFIRM_TRANSACTION'
  payload: {
    id: string
    transactionHash: string
  }
}

interface RemoveTransactionAction {
  type: 'REMOVE_TRANSACTION'
  payload: {
    id: string
  }
}

export type Action =
  | AppendRawTransactionAction
  | DecodeTransactionAction
  | ConfirmTransactionAction
  | RemoveTransactionAction
