import {
  clearLastTransactionExecuted,
  saveLastTransactionExecutedAt,
  useExecutedTransactions,
} from '@/state'
import { useEffect } from 'react'

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
