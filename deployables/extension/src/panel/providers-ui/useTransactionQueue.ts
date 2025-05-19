import type { Transaction } from '@/state'
import { useCallback, useEffect, useState } from 'react'

export const useTransactionQueue = <T extends Transaction>(
  transactions: T[],
) => {
  const [head] = transactions
  const [nextTransaction, setNextTransaction] = useState<T | null>(null)

  const markDone = useCallback(() => {
    setNextTransaction(null)
  }, [])

  useEffect(() => {
    if (nextTransaction != null) {
      return
    }

    if (head == null) {
      return
    }

    setNextTransaction(head)
  }, [head, nextTransaction])

  return { nextTransaction, markDone }
}
