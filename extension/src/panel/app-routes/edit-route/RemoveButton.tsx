import { GhostButton, Modal, PrimaryButton } from '@/components'
import { useRemoveZodiacRoute } from '@/zodiac-routes'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRouteId } from './useRouteId'

export const RemoveButton = () => {
  const navigate = useNavigate()
  const removeRouteById = useRemoveZodiacRoute()
  const routeId = useRouteId()
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

          <PrimaryButton
            style="contrast"
            onClick={() => {
              removeRouteById(routeId)
              navigate('/routes')
            }}
          >
            Remove
          </PrimaryButton>
        </Modal.Actions>
      </Modal>
    </>
  )
}
