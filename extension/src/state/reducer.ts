import { MetaTransaction } from 'ethers-multisend'
import { ContractInfo } from '../utils/abi'
import { Action } from './actions'

export enum ExecutionStatus {
  PENDING,
  SUCCESS,
  REVERTED,
  MODULE_TRANSACTION_REVERTED,
}

export interface TransactionState {
  snapshotId: string
  transaction: MetaTransaction
  status: ExecutionStatus
  contractInfo?: ContractInfo
  transactionHash?: string
  batchTransactionHash?: string
}

const rootReducer = (
  state: TransactionState[],
  action: Action
): TransactionState[] => {
  switch (action.type) {
    case 'APPEND_TRANSACTION': {
      const { snapshotId, transaction } = action.payload
      return [
        ...state,
        { snapshotId, transaction, status: ExecutionStatus.PENDING },
      ]
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

    case 'UPDATE_TRANSACTION_STATUS': {
      const { snapshotId, status } = action.payload
      return state.map((item) =>
        item.snapshotId === snapshotId ? { ...item, status } : item
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
