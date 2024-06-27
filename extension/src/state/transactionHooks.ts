import { useCallback } from 'react'

import { ForkProvider } from '../providers'
import { useProvider } from '../browser/ProvideProvider'

import { useAllTransactions, useDispatch } from '.'

export const useClearTransactions = () => {
  const transactions = useAllTransactions()
  const provider = useProvider()
  const dispatch = useDispatch()

  const hasTransactions = transactions.length > 0
  const clearTransactions = useCallback(async () => {
    if (transactions.length === 0) {
      return
    }

    dispatch({
      type: 'REMOVE_TRANSACTION',
      payload: { snapshotId: transactions[0].snapshotId },
    })

    if (provider instanceof ForkProvider) {
      await provider.deleteFork()
    }
  }, [provider, transactions, dispatch])

  return { hasTransactions, clearTransactions }
}
