import { useConfirmationModal } from '@/components'
import { useClearTransactions } from '../state/transactionHooks'

export const useConfirmClearTransactions = () => {
  const { hasTransactions, clearTransactions } = useClearTransactions()
  const [getConfirmation, ConfirmationModal] = useConfirmationModal()

  const confirmClearTransactions = async () => {
    if (!hasTransactions) {
      return true
    }

    const confirmation = await getConfirmation(
      'Switching the Piloted Safe will empty your current transaction bundle.'
    )

    if (!confirmation) {
      return false
    }

    clearTransactions()

    return true
  }

  return [confirmClearTransactions, ConfirmationModal] as const
}
