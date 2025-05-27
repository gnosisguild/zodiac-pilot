import { useEffect } from 'react'
import { useExecutedTransactions } from './TransactionsContext'
import { clearLastTransactionExecuted } from './clearLastTransactionExecuted'
import { saveLastTransactionExecutedAt } from './saveLastTransactionExecutedAt'

export const useStoreLastExecutedTransaction = () => {
  const executedTransactions = useExecutedTransactions()
  const lastTransaction = executedTransactions.at(-1)

  useEffect(() => {
    if (lastTransaction == null) {
      clearLastTransactionExecuted()
    } else {
      saveLastTransactionExecutedAt(lastTransaction)
    }
  }, [lastTransaction])
}
