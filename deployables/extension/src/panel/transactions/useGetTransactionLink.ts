import { useCallback } from 'react'
import { useProvider } from './ProvideForkProvider'

export const useGetTransactionLink = () => {
  const provider = useProvider()

  return useCallback(
    (txHash: string) => provider.getTransactionLink(txHash),
    [provider],
  )
}
