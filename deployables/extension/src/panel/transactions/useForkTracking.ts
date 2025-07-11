import { useEffect } from 'react'
import { useForkProvider } from './ProvideForkProvider'
import { useDispatch, useRefresh, useTransactions } from './TransactionsContext'
import { commitRefreshTransactions } from './actions'

export const useForkTracking = () => {
  const provider = useForkProvider()
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
