import { Modal, PrimaryButton } from '@zodiac/ui'

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
      title="Clear transactions"
      description="Switching the Safe account will empty your current transaction bundle."
      onClose={onCancel}
    >
      <Modal.Actions>
        <PrimaryButton onClick={onAccept}>Clear transactions</PrimaryButton>
        <Modal.CloseAction>Cancel</Modal.CloseAction>
      </Modal.Actions>
    </Modal>
  )
}
