import { clearTransactions, useDispatch, useTransactions } from '@/state'
import { useCallback } from 'react'

export const useClearTransactions = () => {
  const transactions = useTransactions()
  const dispatch = useDispatch()

  return useCallback(async () => {
    if (transactions.length === 0) {
      return
    }

    dispatch(clearTransactions())
  }, [transactions, dispatch])
}
