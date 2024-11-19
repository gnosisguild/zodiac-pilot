import { Button, Modal, useConfirmationModal } from '@/components'
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
      title="Clear transactions"
      description="Switching the Piloted Safe will empty your current transaction bundle."
      onClose={onClose}
    >
      <Modal.Actions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={() => {
            clearTransactions()
            onClose()
            onConfirm()
          }}
        >
          Clear transactions
        </Button>
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
