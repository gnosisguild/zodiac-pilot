import { useCallback } from 'react'
import { useForkProvider } from './ProvideForkProvider'

export const useGetTransactionLink = () => {
  const provider = useForkProvider()

  return useCallback(
    (txHash: string) => provider.getTransactionLink(txHash),
    [provider],
  )
}
