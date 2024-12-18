import { GhostButton, InlineForm, Modal, PrimaryButton } from '@/components'

type ClearTransactionsModalProps = {
  open: boolean
  newActiveRouteId: string
  intent: string
  onClose: () => void
}

export const ClearTransactionsModal = ({
  open,
  newActiveRouteId,
  intent,
  onClose,
}: ClearTransactionsModalProps) => {
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

        <InlineForm context={{ newActiveRouteId }}>
          <PrimaryButton submit intent={intent} style="contrast">
            Clear transactions
          </PrimaryButton>
        </InlineForm>
      </Modal.Actions>
    </Modal>
  )
}
