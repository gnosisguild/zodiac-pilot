import type { MetaTransactionRequest } from '@zodiac/schema'
import { useEffect } from 'react'
import { useForkProvider } from './ProvideForkProvider'
import { useDispatch } from './TransactionsContext'
import { appendTransaction } from './actions'

export const useInterceptTransactions = () => {
  const provider = useForkProvider()
  const dispatch = useDispatch()

  useEffect(() => {
    const handleTransaction = (transaction: MetaTransactionRequest) => {
      dispatch(appendTransaction({ transaction }))
    }

    provider.on('transaction', handleTransaction)

    return () => {
      provider.off('transaction', handleTransaction)
    }
  }, [dispatch, provider])
}
