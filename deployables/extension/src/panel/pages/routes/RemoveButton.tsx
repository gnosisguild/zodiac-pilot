import { GhostButton, InlineForm, Modal, PrimaryButton } from '@zodiac/ui'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'

type RemoveButtonProps = {
  routeId: string
  intent: string
}

export const RemoveButton = ({ intent, routeId }: RemoveButtonProps) => {
  const [confirmRemove, setConfirmRemove] = useState(false)

  return (
    <>
      <GhostButton
        iconOnly
        icon={Trash2}
        style="critical"
        onClick={() => setConfirmRemove(true)}
      >
        Remove route
      </GhostButton>

      <Modal
        closeLabel="Cancel"
        onClose={() => setConfirmRemove(false)}
        open={confirmRemove}
        title="Remove route"
      >
        Are you sure want to remove this route?
        <Modal.Actions>
          <GhostButton style="contrast" onClick={() => setConfirmRemove(false)}>
            Cancel
          </GhostButton>

          <InlineForm context={{ routeId }}>
            <PrimaryButton submit style="contrast" intent={intent}>
              Remove
            </PrimaryButton>
          </InlineForm>
        </Modal.Actions>
      </Modal>
    </>
  )
}
