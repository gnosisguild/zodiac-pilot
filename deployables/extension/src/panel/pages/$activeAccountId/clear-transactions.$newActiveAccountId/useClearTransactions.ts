import { useDeleteFork } from '@/providers-ui'
import { removeTransaction, useDispatch, useTransactions } from '@/state'
import { useCallback } from 'react'

export const useClearTransactions = () => {
  const transactions = useTransactions()
  const dispatch = useDispatch()
  const deleteFork = useDeleteFork()

  return useCallback(async () => {
    if (transactions.length === 0) {
      return
    }

    dispatch(removeTransaction({ id: transactions[0].id }))

    await deleteFork()
  }, [transactions, dispatch, deleteFork])
}
