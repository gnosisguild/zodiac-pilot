import React, { createContext, useContext, useReducer } from 'react'

import { Action } from './actions'
import reducer, { TransactionState } from './reducer'

export type { TransactionState }

const TransactionsContext = createContext<TransactionState[]>([])
export const useTransactions = () => useContext(TransactionsContext)

const DispatchContext = createContext<React.Dispatch<Action> | null>(null)
export const useDispatch = () => {
  const value = useContext(DispatchContext)
  if (!value) throw new Error('must be wrapped in <ProvideState>')
  return value
}

export const ProvideState: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, [])

  return (
    <DispatchContext.Provider value={dispatch}>
      <TransactionsContext.Provider value={state}>
        {children}
      </TransactionsContext.Provider>
    </DispatchContext.Provider>
  )
}
