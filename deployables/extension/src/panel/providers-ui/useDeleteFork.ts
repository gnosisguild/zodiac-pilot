import { useCallback } from 'react'
import { useProvider } from './ProvideProvider'

export const useDeleteFork = () => {
  const provider = useProvider()

  return useCallback(() => provider.deleteFork(), [provider])
}
