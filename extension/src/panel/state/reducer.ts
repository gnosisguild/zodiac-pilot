import type { MetaTransactionData } from '@safe-global/safe-core-sdk-types'
import type { ContractInfo } from '../utils/abi'
import type { Action } from './actions'
import { ExecutionStatus } from './executionStatus'

export interface TransactionState {
  id: string
  transaction: MetaTransactionData
  status: ExecutionStatus
  snapshotId?: string
  contractInfo?: ContractInfo
  transactionHash?: string
}

export const rootReducer = (
  state: TransactionState[],
  action: Action,
): TransactionState[] => {
  switch (action.type) {
    case 'APPEND_TRANSACTION': {
      const { id, transaction } = action.payload
      return [...state, { id, transaction, status: ExecutionStatus.PENDING }]
    }

    case 'DECODE_TRANSACTION': {
      const { id, contractInfo } = action.payload
      return state.map((item) =>
        item.id === id ? { ...item, contractInfo } : item,
      )
    }

    case 'CONFIRM_TRANSACTION': {
      const { id, snapshotId, transactionHash } = action.payload
      return state.map((item) =>
        item.id === id ? { ...item, snapshotId, transactionHash } : item,
      )
    }

    case 'UPDATE_TRANSACTION_STATUS': {
      const { id, status } = action.payload
      return state.map((item) => (item.id === id ? { ...item, status } : item))
    }

    case 'REMOVE_TRANSACTION': {
      const { id } = action.payload
      return state.slice(
        0,
        state.findIndex((item) => item.id === id),
      )
    }

    case 'CLEAR_TRANSACTIONS': {
      const { lastTransactionId } = action.payload
      return state.slice(
        state.findIndex((item) => item.id === lastTransactionId) + 1,
      )
    }
  }
}
