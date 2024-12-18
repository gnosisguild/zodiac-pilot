import { ForkProvider } from '@/providers'
import { useProvider } from '@/providers-ui'
import { useDispatch, useTransactions } from '@/state'
import { useCallback } from 'react'

export const useClearTransactions = () => {
  const transactions = useTransactions()
  const provider = useProvider()
  const dispatch = useDispatch()

  return useCallback(async () => {
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
  }, [dispatch, transactions, provider])
}
