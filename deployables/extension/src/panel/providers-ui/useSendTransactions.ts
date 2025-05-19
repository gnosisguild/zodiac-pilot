import { usePendingTransactions, useRefresh, useRollback } from '@/state'
import { useEffect } from 'react'
import { useInterceptTransactions } from './useInterceptTransactions'
import { useSendTransaction } from './useSendTransaction'
import { useStoreLastExecutedTransaction } from './useStoreLastExecutedTransaction'
import { useTransactionQueue } from './useTransactionQueue'

export const useSendTransactions = () => {
  const sendTransaction = useSendTransaction()
  const rollback = useRollback()
  const refresh = useRefresh()
  const { nextTransaction, markDone } = useTransactionQueue(
    usePendingTransactions(),
  )

  useStoreLastExecutedTransaction()
  useInterceptTransactions()

  useEffect(() => {
    if (nextTransaction == null) {
      return
    }

    // we're rolling back the chain state to an
    // earlier transaction. we'll wait for this
    // to finish before sending any further transactions
    if (rollback != null) {
      return
    }

    // when we're refreshing the transactions
    // we want to do this on a fresh fork.
    // while the refresh flag is set to true
    // we're still creating that new fork and
    // should not start sending our transactions
    if (refresh === true) {
      return
    }

    sendTransaction(nextTransaction).then(markDone)
  }, [markDone, nextTransaction, refresh, rollback, sendTransaction])
}
