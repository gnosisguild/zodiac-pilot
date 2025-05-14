import {
  confirmRollbackTransaction,
  useDispatch,
  useRollback,
  useTransactions,
} from '@/state'
import { useEffect } from 'react'
import { useRevertToSnapshot } from './useRevertToSnapshot'

export const useRollbackTransaction = () => {
  const transactionToRollback = useRollback()
  const transactions = useTransactions()
  const dispatch = useDispatch()
  const revertToSnapshot = useRevertToSnapshot()

  useEffect(() => {
    if (transactionToRollback == null) {
      return
    }

    // This happens when there is only one transaction
    // and you roll it back. Effectively, we don't need to
    // do anything. When the last transaction is removed
    // the fork is removed as well, so there is nothing
    // to roll back
    if (transactions.length === 0) {
      dispatch(confirmRollbackTransaction({ id: transactionToRollback.id }))

      return
    }

    revertToSnapshot(transactionToRollback).then(() => {
      dispatch(confirmRollbackTransaction({ id: transactionToRollback.id }))
    })
  }, [dispatch, revertToSnapshot, transactionToRollback, transactions.length])
}
