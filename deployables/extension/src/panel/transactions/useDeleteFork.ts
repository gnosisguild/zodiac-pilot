import { useEffect } from 'react'
import { useProvider } from './ProvideProvider'
import { useDispatch, useRefresh, useTransactions } from './TransactionsContext'
import { commitRefreshTransactions } from './actions'

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
