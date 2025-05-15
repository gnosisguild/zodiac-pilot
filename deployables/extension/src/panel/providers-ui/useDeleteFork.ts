import {
  commitRefreshTransactions,
  useDispatch,
  useRefresh,
  useTransactions,
} from '@/state'
import { useEffect } from 'react'
import { useProvider } from './ProvideProvider'

export const useDeleteFork = () => {
  const provider = useProvider()
  const transactions = useTransactions()
  const dispatch = useDispatch()
  const refresh = useRefresh()

  useEffect(() => {
    if (transactions.length > 0 && !refresh) {
      return
    }

    provider.deleteFork().then(() => {
      dispatch(commitRefreshTransactions())
    })
  }, [dispatch, provider, refresh, transactions.length])
}
