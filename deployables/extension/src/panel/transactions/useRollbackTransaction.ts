import { useCallback } from 'react'
import { useDispatch } from './TransactionsContext'
import { rollbackTransaction } from './actions'

export const useRollbackTransaction = () => {
  const dispatch = useDispatch()

  return useCallback(
    (id: string) => dispatch(rollbackTransaction({ id })),
    [dispatch],
  )
}
