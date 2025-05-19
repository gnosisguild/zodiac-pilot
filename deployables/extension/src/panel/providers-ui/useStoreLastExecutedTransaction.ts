import { saveLastTransactionExecutedAt, useExecutedTransactions } from '@/state'
import { useEffect } from 'react'
import { useTransactionQueue } from './useTransactionQueue'

export const useStoreLastExecutedTransaction = () => {
  const { nextTransaction, markDone } = useTransactionQueue(
    useExecutedTransactions(),
  )

  useEffect(() => {
    if (nextTransaction == null) {
      return
    }

    saveLastTransactionExecutedAt(nextTransaction).then(markDone)
  }, [markDone, nextTransaction])
}
