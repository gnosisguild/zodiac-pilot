import { TransactionInput } from 'react-multisend'

interface AppendRawTransactionAction {
  type: 'APPEND_RAW_TRANSACTION'
  payload: { input: TransactionInput; isDelegateCall: boolean }
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

interface RemoveTransactionAction {
  type: 'REMOVE_TRANSACTION'
  payload: {
    id: string
  }
}

interface SubmitTransactionsAction {
  type: 'SUBMIT_TRANSACTIONS'
  payload: {
    batchTransactionHash: string
  }
}

interface ClearTransactionsAction {
  type: 'CLEAR_TRANSACTIONS'
  payload: {
    batchTransactionHash: string
  }
}

export type Action =
  | AppendRawTransactionAction
  | DecodeTransactionAction
  | ConfirmTransactionAction
  | RemoveTransactionAction
  | SubmitTransactionsAction
  | ClearTransactionsAction
