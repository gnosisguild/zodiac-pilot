import { MetaTransaction } from '../types'

interface AppendTransactionAction {
  type: 'APPEND_TRANSACTION'
  payload: {
    snapshotId: string
    transaction: MetaTransaction
  }
}

interface DecodeTransactionAction {
  type: 'DECODE_TRANSACTION'
  payload: {
    snapshotId: string
    contractInfo: MetaTransaction
  }
}

interface ConfirmTransactionAction {
  type: 'CONFIRM_TRANSACTION'
  payload: {
    snapshotId: string
    transactionHash: string
  }
}

interface RemoveTransactionAction {
  type: 'REMOVE_TRANSACTION'
  payload: {
    snapshotId: string
  }
}

interface RemoveTransactionAction {
  type: 'REMOVE_TRANSACTION'
  payload: {
    snapshotId: string
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
  | AppendTransactionAction
  | DecodeTransactionAction
  | ConfirmTransactionAction
  | RemoveTransactionAction
  | SubmitTransactionsAction
  | ClearTransactionsAction
