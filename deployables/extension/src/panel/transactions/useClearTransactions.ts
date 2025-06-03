import { useCallback } from 'react'
import { useDispatch } from './TransactionsContext'
import { clearTransactions } from './actions'

export const useClearTransactions = () => {
  const dispatch = useDispatch()

  return useCallback(() => dispatch(clearTransactions()), [dispatch])
}
