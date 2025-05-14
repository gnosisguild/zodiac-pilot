import { appendTransaction, useDispatch } from '@/state'
import type { MetaTransactionRequest } from '@zodiac/schema'
import { useEffect } from 'react'
import { useProvider } from './ProvideProvider'

export const useInterceptTransactions = () => {
  const provider = useProvider()
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
