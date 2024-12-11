import {
  GhostButton,
  Modal,
  PrimaryButton,
  useConfirmationModal,
} from '@/components'
import { useClearTransactions } from '../state/transactionHooks'

type ClearTransactionsModalProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

export const ClearTransactionsModal = ({
  open,
  onClose,
  onConfirm,
}: ClearTransactionsModalProps) => {
  const { clearTransactions } = useClearTransactions()

  return (
    <Modal
      open={open}
      closeLabel="Cancel"
      title="Clear transactions"
      description="Switching the Piloted Safe will empty your current transaction bundle."
      onClose={onClose}
    >
      <Modal.Actions>
        <GhostButton style="contrast" onClick={onClose}>
          Cancel
        </GhostButton>

        <PrimaryButton
          style="contrast"
          onClick={() => {
            clearTransactions()
            onClose()
            onConfirm()
          }}
        >
          Clear transactions
        </PrimaryButton>
      </Modal.Actions>
    </Modal>
  )
}

export const useConfirmClearTransactions = () => {
  const { hasTransactions, clearTransactions } = useClearTransactions()
  const [getConfirmation, ConfirmationModal] = useConfirmationModal()

  const confirmClearTransactions = async () => {
    if (!hasTransactions) {
      return true
    }

    const confirmation = await getConfirmation(
      'Switching the Piloted Safe will empty your current transaction bundle.',
    )

    if (!confirmation) {
      return false
    }

    clearTransactions()

    return true
  }

  return [confirmClearTransactions, ConfirmationModal] as const
}
