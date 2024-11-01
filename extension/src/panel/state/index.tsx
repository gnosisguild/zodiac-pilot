import {
  createContext,
  Dispatch,
  PropsWithChildren,
  useContext,
  useReducer,
} from 'react'
import { Action } from './actions'
import { rootReducer, TransactionState } from './reducer'

export type { TransactionState }

const TransactionsContext = createContext<TransactionState[]>([])
export const useTransactions = () => useContext(TransactionsContext)

const DispatchContext = createContext<Dispatch<Action> | null>(null)
export const useDispatch = () => {
  const value = useContext(DispatchContext)
  if (!value) throw new Error('must be wrapped in <ProvideState>')
  return value
}

export const ProvideState = ({ children }: PropsWithChildren) => {
  const [state, dispatch] = useReducer(rootReducer, [])

  return (
    <DispatchContext.Provider value={dispatch}>
      <TransactionsContext.Provider value={state}>
        {children}
      </TransactionsContext.Provider>
    </DispatchContext.Provider>
  )
}

export { ExecutionStatus } from './executionStatus'
