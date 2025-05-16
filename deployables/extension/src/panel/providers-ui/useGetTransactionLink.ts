import { useCallback } from 'react'
import { useProvider } from './ProvideProvider'

export const useGetTransactionLink = () => {
  const provider = useProvider()

  return useCallback(
    (txHash: string) => provider.getTransactionLink(txHash),
    [provider],
  )
}
