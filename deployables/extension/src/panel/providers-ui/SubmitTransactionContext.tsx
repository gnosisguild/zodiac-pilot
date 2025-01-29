import { useExecutionRoute, useRouteProvider } from '@/execution-routes'
import { useDispatch, useTransactions } from '@/state'
import { invariant } from '@epic-web/invariant'
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
} from 'react'
import {
  execute,
  ExecutionActionType,
  type ExecutionState,
  planExecution,
  type Route,
} from 'ser-kit'

const SubmitTransactionsContext = createContext<
  (() => Promise<{ txHash?: `0x${string}`; safeTxHash?: `0x${string}` }>) | null
>(null)

export const useSubmitTransactions = () => useContext(SubmitTransactionsContext)

export const ProvideSubmitTransactionContext = ({
  children,
}: PropsWithChildren) => {
  const route = useExecutionRoute()
  const provider = useRouteProvider()
  const transactions = useTransactions()
  const dispatch = useDispatch()

  const submitTransactions = useCallback(async () => {
    const metaTransactions = transactions.map((txState) => txState.transaction)
    const lastTransactionId = transactions[transactions.length - 1].id

    console.debug(
      transactions.length === 1
        ? 'submitting transaction...'
        : `submitting ${transactions.length} transactions as multi-send batch...`,
      transactions,
    )

    invariant(
      route.initiator != null,
      'Cannot execute without a connected Pilot wallet',
    )
    invariant(provider != null, 'Cannot execute without a connected provider')

    const plan = await planExecution(metaTransactions, route as Route)
    console.debug('Execution plan:', plan)

    const state = [] as ExecutionState
    await execute(plan, state, provider, { origin: 'Zodiac Pilot' })

    dispatch({
      type: 'CLEAR_TRANSACTIONS',
      payload: { lastTransactionId },
    })

    // return the txHash if the execution is already complete or the safeTxHash if the safe transaction was proposed
    const safeTxHash =
      state[
        plan.findLastIndex(
          (action) => action.type === ExecutionActionType.PROPOSE_TRANSACTION,
        )
      ]
    const txHash =
      state[
        plan.findLastIndex(
          (action) => action.type === ExecutionActionType.EXECUTE_TRANSACTION,
        )
      ]
    return { safeTxHash, txHash: !safeTxHash ? txHash : undefined }
  }, [transactions, provider, dispatch, route])

  return (
    <SubmitTransactionsContext.Provider value={submitTransactions}>
      {children}
    </SubmitTransactionsContext.Provider>
  )
}
