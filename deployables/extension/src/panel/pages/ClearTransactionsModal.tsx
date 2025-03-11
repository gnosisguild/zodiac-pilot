import { GhostButton, Modal, PrimaryButton } from '@zodiac/ui'

type ClearTransactionsModalProps = {
  open: boolean

  onCancel: () => void
  onAccept: () => void
}

export const ClearTransactionsModal = ({
  open,
  onCancel,
  onAccept,
}: ClearTransactionsModalProps) => {
  return (
    <Modal
      open={open}
      closeLabel="Cancel"
      title="Clear transactions"
      description="Switching the Piloted Safe will empty your current transaction bundle."
      onClose={onCancel}
    >
      <Modal.Actions>
        <PrimaryButton style="contrast" onClick={onAccept}>
          Clear transactions
        </PrimaryButton>

        <GhostButton style="contrast" onClick={onCancel}>
          Cancel
        </GhostButton>
      </Modal.Actions>
    </Modal>
  )
}
