import {
  usePendingTransactions,
  useRefresh,
  useRollback,
  type UnconfirmedTransaction,
} from '@/state'
import { useCallback, useEffect, useState } from 'react'
import { useSendTransaction } from './useSendTransaction'

export const useSendTransactions = () => {
  const sendTransaction = useSendTransaction()
  const rollback = useRollback()
  const refresh = useRefresh()
  const { nextTransaction, markDone } = useNextTransactionToExecute()

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

const useNextTransactionToExecute = () => {
  const [pendingTransaction] = usePendingTransactions()
  const [nextTransaction, setNextTransaction] =
    useState<UnconfirmedTransaction | null>(null)

  const markDone = useCallback(() => {
    setNextTransaction(null)
  }, [])

  useEffect(() => {
    if (nextTransaction != null) {
      return
    }

    if (pendingTransaction == null) {
      return
    }

    setNextTransaction(pendingTransaction)
  }, [nextTransaction, pendingTransaction])

  return { nextTransaction, markDone }
}
