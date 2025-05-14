import {
  commitRefreshTransactions,
  useDispatch,
  useTransactions,
} from '@/state'
import { useEffect } from 'react'
import { useProvider } from './ProvideProvider'

export const useDeleteFork = () => {
  const provider = useProvider()
  const transactions = useTransactions()
  const dispatch = useDispatch()

  useEffect(() => {
    if (transactions.length > 0) {
      return
    }

    provider.deleteFork().then(() => {
      dispatch(commitRefreshTransactions())
    })
  }, [dispatch, provider, transactions.length])
}
