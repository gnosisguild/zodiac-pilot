import { GhostButton, Modal, PrimaryButton } from '@/components'
import { useClearTransactions } from './useClearTransactions'

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
