
import { MetaTransactionData } from '@safe-global/safe-core-sdk-types'
import { ContractInfo } from '../utils/abi'
import { ExecutionStatus } from './reducer'

interface AppendTransactionAction {
  type: 'APPEND_TRANSACTION'
  payload: {
    snapshotId: string
    transaction: MetaTransactionData
  }
}

interface DecodeTransactionAction {
  type: 'DECODE_TRANSACTION'
  payload: {
    snapshotId: string
    contractInfo: ContractInfo
  }
}

interface ConfirmTransactionAction {
  type: 'CONFIRM_TRANSACTION'
  payload: {
    snapshotId: string
    transactionHash: string
  }
}

interface UpdateTransactionStatusAction {
  type: 'UPDATE_TRANSACTION_STATUS'
  payload: {
    snapshotId: string
    status: ExecutionStatus
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
  | UpdateTransactionStatusAction
  | RemoveTransactionAction
  | SubmitTransactionsAction
  | ClearTransactionsAction
