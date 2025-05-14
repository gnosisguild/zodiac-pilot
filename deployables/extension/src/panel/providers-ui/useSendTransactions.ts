import { usePendingTransactions, useRefresh, useRollback } from '@/state'
import { useEffect, useRef } from 'react'
import { useSendTransaction } from './useSendTransaction'

export const useSendTransactions = () => {
  const pendingTransactions = usePendingTransactions()
  const sendTransaction = useSendTransaction()
  const rollback = useRollback()
  const refresh = useRefresh()

  const progressRef = useRef(false)

  useEffect(() => {
    if (progressRef.current) {
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

    progressRef.current = true

    const submit = async () => {
      for (const transaction of pendingTransactions) {
        await sendTransaction(transaction)
      }

      progressRef.current = false
    }

    submit()
  }, [pendingTransactions, refresh, rollback, sendTransaction])
}
