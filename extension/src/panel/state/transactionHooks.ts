import { ForkProvider } from '@/providers'
import { useProvider } from '@/providers-ui'
import { useCallback } from 'react'
import { useDispatch, useTransactions } from './provideState'

export const useClearTransactions = () => {
  const transactions = useTransactions()
  const provider = useProvider()
  const dispatch = useDispatch()

  const hasTransactions = transactions.length > 0
  const clearTransactions = useCallback(async () => {
    if (transactions.length === 0) {
      return
    }

    dispatch({
      type: 'REMOVE_TRANSACTION',
      payload: { id: transactions[0].id },
    })

    if (provider instanceof ForkProvider) {
      await provider.deleteFork()
    }
  }, [provider, transactions, dispatch])

  return { hasTransactions, clearTransactions }
}
