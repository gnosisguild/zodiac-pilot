import { useRollback, useTransactions } from '@/state'
import { useEffect } from 'react'
import { useProvider } from './ProvideProvider'

export const useDeleteFork = () => {
  const provider = useProvider()
  const transactions = useTransactions()
  const rollback = useRollback()

  useEffect(() => {
    if (transactions.length > 0) {
      return
    }

    provider.deleteFork()
  }, [provider, rollback, transactions.length])
}
