import type { MetaTransactionRequest } from 'ser-kit'
import type { ContractInfo } from '../utils/abi'
import { Action, type TransactionAction } from './actions'
import { ExecutionStatus } from './executionStatus'

export interface TransactionState {
  id: string
  transaction: MetaTransactionRequest
  status: ExecutionStatus
  snapshotId?: string
  contractInfo?: ContractInfo
  transactionHash?: string
}

export const transactionsReducer = (
  state: TransactionState[],
  { type, payload }: TransactionAction,
): TransactionState[] => {
  switch (type) {
    case Action.Append: {
      const { id, transaction } = payload
      return [...state, { id, transaction, status: ExecutionStatus.PENDING }]
    }

    case Action.Decode: {
      const { id, contractInfo } = payload
      return state.map((item) =>
        item.id === id ? { ...item, contractInfo } : item,
      )
    }

    case Action.Confirm: {
      const { id, snapshotId, transactionHash } = payload
      return state.map((item) =>
        item.id === id ? { ...item, snapshotId, transactionHash } : item,
      )
    }

    case Action.UpdateStatus: {
      const { id, status } = payload
      return state.map((item) => (item.id === id ? { ...item, status } : item))
    }

    case Action.Remove: {
      const { id } = payload
      return state.filter((item) => item.id !== id)
    }

    case Action.Clear: {
      if (payload == null) {
        return []
      }

      const { fromId } = payload
      const index = state.findIndex((item) => item.id === fromId)

      if (index === -1) {
        return state
      }

      return state.slice(0, index)
    }
  }
}
