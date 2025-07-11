import { sentry } from '@/sentry'
import { useEffect } from 'react'
import {
  usePendingTransactions,
  useRefresh,
  useRollback,
} from './TransactionsContext'
import { useInterceptTransactions } from './useInterceptTransactions'
import { useSendTransaction } from './useSendTransaction'
import { useStoreLastExecutedTransaction } from './useStoreLastExecutedTransaction'
import { useTransactionQueue } from './useTransactionQueue'

export const useExecutionTracking = () => {
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

    const abortController = new AbortController()

    sendTransaction(nextTransaction)
      .then(() => {
        if (!abortController.signal.aborted) {
          markDone()
        }
      })
      .catch((error) => {
        sentry.captureException(error)
      })

    return () => {
      abortController.abort('Effect cancelled')
    }
  }, [markDone, nextTransaction, refresh, rollback, sendTransaction])
}
