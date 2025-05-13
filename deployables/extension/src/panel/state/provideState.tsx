import { invariant } from '@epic-web/invariant'
import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  useContext,
  useReducer,
} from 'react'
import type { TransactionAction } from './actions'
import { rootReducer, type TransactionState } from './reducer'

const TransactionsContext = createContext<TransactionState[]>([])

export const useTransactions = () => useContext(TransactionsContext)

export const useTransaction = (transactionId: string) => {
  const transactions = useTransactions()

  const transaction = transactions.find(
    (transaction) => transaction.id === transactionId,
  )

  invariant(
    transaction != null,
    `Could not find transaction with id "${transactionId}"`,
  )

  return transaction
}

const DispatchContext = createContext<{
  dispatch: Dispatch<TransactionAction>
}>({
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
