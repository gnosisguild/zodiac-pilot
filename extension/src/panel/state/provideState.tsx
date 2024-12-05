import {
  createContext,
  Dispatch,
  PropsWithChildren,
  useContext,
  useReducer,
} from 'react'
import { Action } from './actions'
import { rootReducer, TransactionState } from './reducer'

const TransactionsContext = createContext<TransactionState[]>([])

export const useTransactions = () => useContext(TransactionsContext)

const DispatchContext = createContext<{ dispatch: Dispatch<Action> }>({
  dispatch() {
    throw new Error('must be wrapped in <ProvideState>')
  },
})

export const useDispatch = () => {
  const { dispatch } = useContext(DispatchContext)

  return dispatch
}

type ProvideStateProps = PropsWithChildren<{
  initialState?: TransactionState[]
}>

export const ProvideState = ({
  children,
  initialState = [],
}: ProvideStateProps) => {
  const [state, dispatch] = useReducer(rootReducer, initialState)

  return (
    <DispatchContext.Provider value={{ dispatch }}>
      <TransactionsContext.Provider value={state}>
        {children}
      </TransactionsContext.Provider>
    </DispatchContext.Provider>
  )
}
