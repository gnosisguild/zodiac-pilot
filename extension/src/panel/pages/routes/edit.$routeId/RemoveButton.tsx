import { GhostButton, Modal, PrimaryButton } from '@/components'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Form } from 'react-router'

export const RemoveButton = () => {
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

          <Form method="post">
            <PrimaryButton submit style="contrast">
              Remove
            </PrimaryButton>
          </Form>
        </Modal.Actions>
      </Modal>
    </>
  )
}
