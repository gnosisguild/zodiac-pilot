import { TransactionInput } from 'react-multisend'

import { Action } from './actions'

export interface TransactionState {
  input: TransactionInput
  transactionHash?: string
}

const rootReducer = (
  state: TransactionState[],
  action: Action
): TransactionState[] => {
  switch (action.type) {
    case 'APPEND_RAW_TRANSACTION': {
      const input = action.payload
      return [...state, { input }]
    }

    case 'DECODE_TRANSACTION': {
      const input = action.payload
      return state.map((item) =>
        item.input.id === input.id ? { ...item, input } : item
      )
    }

    case 'CONFIRM_TRANSACTION': {
      const { id, transactionHash } = action.payload
      return state.map((item) =>
        item.input.id === id ? { ...item, transactionHash } : item
      )
    }

    case 'REMOVE_TRANSACTION': {
      const { id } = action.payload
      return state.slice(
        0,
        state.findIndex((item) => item.input.id === id)
      )
    }
  }
}

export default rootReducer
