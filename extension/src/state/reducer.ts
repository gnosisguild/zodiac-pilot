import { MetaTransaction } from '../types'

import { Action } from './actions'

export interface TransactionState {
  snapshotId: string
  transaction: MetaTransaction
  transactionHash?: string
  batchTransactionHash?: string
}

const rootReducer = (
  state: TransactionState[],
  action: Action
): TransactionState[] => {
  switch (action.type) {
    case 'APPEND_RANSACTION': {
      const { snapshotId, transaction } = action.payload
      return [...state, { snapshotId, transaction }]
    }

    case 'DECODE_TRANSACTION': {
      const { snapshotId, contractInfo } = action.payload
      return state.map((item) =>
        item.snapshotId === snapshotId ? { ...item, contractInfo } : item
      )
    }

    case 'CONFIRM_TRANSACTION': {
      const { snapshotId, transactionHash } = action.payload
      return state.map((item) =>
        item.snapshotId === snapshotId ? { ...item, transactionHash } : item
      )
    }

    case 'REMOVE_TRANSACTION': {
      const { snapshotId } = action.payload
      return state.slice(
        0,
        state.findIndex((item) => item.snapshotId === snapshotId)
      )
    }

    case 'SUBMIT_TRANSACTIONS': {
      const { batchTransactionHash } = action.payload
      return state.map((item) =>
        !item.batchTransactionHash ? { ...item, batchTransactionHash } : item
      )
    }

    case 'CLEAR_TRANSACTIONS': {
      const { batchTransactionHash } = action.payload
      return state.filter(
        (item) => item.batchTransactionHash === batchTransactionHash
      )
    }
  }
}

export default rootReducer
