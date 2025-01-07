import {
  GhostButton,
  InlineForm,
  Modal,
  PrimaryButton,
  type InlineFormContext,
} from '@zodiac/ui'

type ClearTransactionsModalProps = {
  open: boolean
  newActiveRouteId: string
  additionalContext?: InlineFormContext
  intent: string
  onClose: () => void
}

export const ClearTransactionsModal = ({
  open,
  newActiveRouteId,
  intent,
  additionalContext,
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

        <InlineForm context={{ newActiveRouteId, ...additionalContext }}>
          <PrimaryButton submit intent={intent} style="contrast">
            Clear transactions
          </PrimaryButton>
        </InlineForm>
      </Modal.Actions>
    </Modal>
  )
}
