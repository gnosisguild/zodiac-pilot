import type { MetaTransactionRequest } from 'ser-kit'
import type { ContractInfo } from '../utils/abi'
import { ExecutionStatus } from './executionStatus'

export enum Action {
  Append = 'Append',
  Decode = 'Decode',
  Confirm = 'Confirm',
  UpdateStatus = 'UpdateStatus',
  Remove = 'Remove',
  Clear = 'Clear',
}

interface AppendTransactionAction {
  type: Action.Append
  payload: {
    id: string
    transaction: MetaTransactionRequest
  }
}

export const appendTransaction = (
  payload: AppendTransactionAction['payload'],
): AppendTransactionAction => ({ type: Action.Append, payload })

interface DecodeTransactionAction {
  type: Action.Decode
  payload: {
    id: string
    contractInfo: ContractInfo
  }
}

export const decodeTransaction = (
  payload: DecodeTransactionAction['payload'],
): DecodeTransactionAction => ({ type: Action.Decode, payload })

interface ConfirmTransactionAction {
  type: Action.Confirm
  payload: {
    id: string
    snapshotId: string
    transactionHash: string
  }
}

export const confirmTransaction = (
  payload: ConfirmTransactionAction['payload'],
): ConfirmTransactionAction => ({ type: Action.Confirm, payload })

interface UpdateTransactionStatusAction {
  type: Action.UpdateStatus
  payload: {
    id: string
    status: ExecutionStatus
  }
}

export const updateTransactionStatus = (
  payload: UpdateTransactionStatusAction['payload'],
): UpdateTransactionStatusAction => ({ type: Action.UpdateStatus, payload })

interface RemoveTransactionAction {
  type: Action.Remove
  payload: {
    id: string
  }
}

export const removeTransaction = (
  payload: RemoveTransactionAction['payload'],
): RemoveTransactionAction => ({ type: Action.Remove, payload })

interface ClearTransactionsAction {
  type: Action.Clear
  payload: {
    id: string
  }
}

export const clearTransactions = (
  payload: ClearTransactionsAction['payload'],
): ClearTransactionsAction => ({ type: Action.Clear, payload })

export type TransactionAction =
  | AppendTransactionAction
  | DecodeTransactionAction
  | ConfirmTransactionAction
  | UpdateTransactionStatusAction
  | RemoveTransactionAction
  | ClearTransactionsAction
