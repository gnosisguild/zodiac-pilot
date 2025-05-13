import type { ConfirmedTransaction } from '@/state'
import { useCallback } from 'react'
import { useProvider } from './ProvideProvider'

export const useRevertToSnapshot = () => {
  const provider = useProvider()

  return useCallback(
    async ({ snapshotId }: ConfirmedTransaction) =>
      provider.request({ method: 'evm_revert', params: [snapshotId] }),
    [provider],
  )
}
