import type { MetaTransactionRequest } from '@zodiac/schema'
import type { ContractInfo } from './state'

export enum Action {
  Append = 'Append',
  Decode = 'Decode',
  Confirm = 'Confirm',
  Remove = 'Remove',
  Clear = 'Clear',
  Fail = 'Fail',
  Finish = 'Finish',
  Revert = 'Revert',
  Rollback = 'Rollback',
  ConfirmRollback = 'ConfirmRollback',
  Translate = 'Translate',
  Refresh = 'Refresh',
  CommitRefresh = 'CommitRefresh',
}

interface AppendTransactionAction {
  type: Action.Append
  payload: {
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

type FailTransactionAction = {
  type: Action.Fail
  payload: {
    id: string
  }
}

export const failTransaction = (
  payload: FailTransactionAction['payload'],
): FailTransactionAction => ({
  type: Action.Fail,
  payload,
})

type FinishTransactionAction = {
  type: Action.Finish
  payload: { id: string }
}

export const finishTransaction = (
  payload: FinishTransactionAction['payload'],
): FinishTransactionAction => ({ type: Action.Finish, payload })

type RevertTransactionAction = {
  type: Action.Revert
  payload: { id: string }
}

export const revertTransaction = (
  payload: RevertTransactionAction['payload'],
): RevertTransactionAction => ({ type: Action.Revert, payload })

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
  payload?: {
    fromId: string
  }
}

export const clearTransactions = (
  payload?: ClearTransactionsAction['payload'],
): ClearTransactionsAction => ({ type: Action.Clear, payload })

type RollbackTransactionType = {
  type: Action.Rollback
  payload: {
    id: string
  }
}

export const rollbackTransaction = (
  payload: RollbackTransactionType['payload'],
): RollbackTransactionType => ({ type: Action.Rollback, payload })

type ConfirmRollbackTransactionAction = {
  type: Action.ConfirmRollback
  payload: {
    id: string
  }
}

export const confirmRollbackTransaction = (
  payload: ConfirmRollbackTransactionAction['payload'],
): ConfirmRollbackTransactionAction => ({
  type: Action.ConfirmRollback,
  payload,
})

type TranslateTransactionAction = {
  type: Action.Translate
  payload: {
    id: string
    translations: MetaTransactionRequest[]
  }
}

export const translateTransaction = (
  payload: TranslateTransactionAction['payload'],
): TranslateTransactionAction => ({ type: Action.Translate, payload })

type RefreshTransactionsAction = {
  type: Action.Refresh
  payload: null
}

export const refreshTransactions = (): RefreshTransactionsAction => ({
  type: Action.Refresh,
  payload: null,
})

type CommitRefreshAction = {
  type: Action.CommitRefresh
  payload: null
}

export const commitRefreshTransactions = (): CommitRefreshAction => ({
  type: Action.CommitRefresh,
  payload: null,
})

export type TransactionAction =
  | AppendTransactionAction
  | DecodeTransactionAction
  | ConfirmTransactionAction
  | RemoveTransactionAction
  | ClearTransactionsAction
  | FailTransactionAction
  | FinishTransactionAction
  | RevertTransactionAction
  | RollbackTransactionType
  | ConfirmRollbackTransactionAction
  | TranslateTransactionAction
  | RefreshTransactionsAction
  | CommitRefreshAction
