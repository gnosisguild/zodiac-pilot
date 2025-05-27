import { useCallback } from 'react'
import { useDispatch } from './TransactionsContext'
import { refreshTransactions } from './actions'

export const useRefreshTransactions = () => {
  const dispatch = useDispatch()

  return useCallback(() => dispatch(refreshTransactions()), [dispatch])
}
