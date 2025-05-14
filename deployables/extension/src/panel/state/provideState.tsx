import { invariant } from '@epic-web/invariant'
import {
  createContext,
  useContext,
  useReducer,
  type Dispatch,
  type PropsWithChildren,
} from 'react'
import type { TransactionAction } from './actions'
import { ExecutionStatus } from './executionStatus'
import { isConfirmedTransaction } from './isConfirmedTransaction'
import { transactionsReducer, type State, type Transaction } from './reducer'

const TransactionsContext = createContext<State>({
  pending: [],
  confirmed: [],
  done: [],
  failed: [],
  reverted: [],

  rollback: null,
})

export const useTransactions = () => {
  const state = useContext(TransactionsContext)

  return [
    ...state.pending,
    ...state.confirmed,
    ...state.done,
    ...state.reverted,
    ...state.failed,
  ].toSorted((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
}

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

export const useTransactionStatus = (
  transaction: Transaction,
): ExecutionStatus => {
  const { pending, done, failed, reverted, confirmed } =
    useContext(TransactionsContext)

  if (pending.includes(transaction)) {
    return ExecutionStatus.PENDING
  }

  invariant(
    isConfirmedTransaction(transaction),
    'Transaction is not pending but also not confirmed',
  )

  if (confirmed.includes(transaction)) {
    return ExecutionStatus.CONFIRMED
  }

  if (done.includes(transaction)) {
    return ExecutionStatus.SUCCESS
  }

  if (failed.includes(transaction)) {
    return ExecutionStatus.FAILED
  }

  if (reverted.includes(transaction)) {
    return ExecutionStatus.META_TRANSACTION_REVERTED
  }

  throw new Error(`Transaction with id "${transaction.id}" could not be found`)
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
  initialState?: State
}>

export const ProvideState = ({
  children,
  initialState = {
    pending: [],
    confirmed: [],
    done: [],
    reverted: [],
    failed: [],

    rollback: null,
  },
}: ProvideStateProps) => {
  const [state, dispatch] = useReducer(transactionsReducer, initialState)

  return (
    <DispatchContext.Provider value={{ dispatch }}>
      <TransactionsContext.Provider value={state}>
        {children}
      </TransactionsContext.Provider>
    </DispatchContext.Provider>
  )
}

export const useRollback = () => {
  const { rollback } = useContext(TransactionsContext)

  return rollback
}

export const usePendingTransactions = () => {
  const { pending } = useContext(TransactionsContext)

  return pending
}
