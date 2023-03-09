import { useCallback } from 'react'
import { useAllTransactions, useDispatch } from '.'
import { ForkProvider } from '../../providers'
import { useProvider } from '../ProvideProvider'

export const useClearTransactions = () => {
  const transactions = useAllTransactions()
  const provider = useProvider()
  const dispatch = useDispatch()

  const hasTransactions = transactions.length > 0
  const clearTransactions = useCallback(async () => {
    if (transactions.length === 0) {
      return
    }

    const firstTransaction = transactions[0]
    const checkpoint = firstTransaction.input.id

    dispatch({ type: 'REMOVE_TRANSACTION', payload: { id: checkpoint } })

    if (!(provider instanceof ForkProvider)) {
      throw new Error('This is only supported when using ForkProvider')
    }

    await provider.request({ method: 'evm_revert', params: [checkpoint] })
  }, [provider, transactions, dispatch])

  return { hasTransactions, clearTransactions }
}
