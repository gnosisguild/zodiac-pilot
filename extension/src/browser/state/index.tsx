import React, { createContext, ReactNode, useContext, useReducer } from 'react'

import { Action } from './actions'
import reducer, { TransactionState } from './reducer'

export type { TransactionState }

const TransactionsContext = createContext<TransactionState[]>([])
export const useAllTransactions = () => useContext(TransactionsContext)
export const useNewTransactions = () =>
  useContext(TransactionsContext).filter((tx) => !tx.batchTransactionHash)
export const usePendingTransactions = () =>
  useContext(TransactionsContext).filter((tx) => tx.batchTransactionHash)

const DispatchContext = createContext<React.Dispatch<Action> | null>(null)
export const useDispatch = () => {
  const value = useContext(DispatchContext)
  if (!value) throw new Error('must be wrapped in <ProvideState>')
  return value
}

export const ProvideState: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, [])

  return (
    <DispatchContext.Provider value={dispatch}>
      <TransactionsContext.Provider value={state}>
        {children}
      </TransactionsContext.Provider>
    </DispatchContext.Provider>
  )
}
