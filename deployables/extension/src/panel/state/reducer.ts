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

export const rootReducer = (
  state: TransactionState[],
  action: TransactionAction,
): TransactionState[] => {
  switch (action.type) {
    case Action.Append: {
      const { id, transaction } = action.payload
      return [...state, { id, transaction, status: ExecutionStatus.PENDING }]
    }

    case Action.Decode: {
      const { id, contractInfo } = action.payload
      return state.map((item) =>
        item.id === id ? { ...item, contractInfo } : item,
      )
    }

    case Action.Confirm: {
      const { id, snapshotId, transactionHash } = action.payload
      return state.map((item) =>
        item.id === id ? { ...item, snapshotId, transactionHash } : item,
      )
    }

    case Action.UpdateStatus: {
      const { id, status } = action.payload
      return state.map((item) => (item.id === id ? { ...item, status } : item))
    }

    case Action.Remove: {
      const { id } = action.payload
      return state.filter((item) => item.id !== id)
    }

    case Action.Clear: {
      const { id } = action.payload
      const idx = state.findIndex((item) => item.id === id)
      return idx >= 0 ? state.slice(0, idx) : state
    }
  }
}
