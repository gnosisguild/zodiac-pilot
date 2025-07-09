import { useIsPending } from '@zodiac/hooks'
import { InlineForm, Modal, PrimaryButton } from '@zodiac/ui'
import { href, useNavigate } from 'react-router'
import type { Route } from './+types/remove-workspace'
import { Intent } from './intents'

const RemoveWorkspace = ({ params: { workspaceId } }: Route.ComponentProps) => {
  const navigate = useNavigate()

  return (
    <Modal
      open
      title="Remove workspace"
      onClose={() =>
        navigate(
          href('/workspace/:workspaceId/admin/workspaces', { workspaceId }),
        )
      }
    >
      Are you sure you want to remove this workspace? This action cannot be
      undone.
      <Modal.Actions>
        <InlineForm>
          <PrimaryButton
            submit
            intent={Intent.RemoveWorkspace}
            busy={useIsPending(Intent.RemoveWorkspace)}
          >
            Remove
          </PrimaryButton>
        </InlineForm>

        <Modal.CloseAction>Cancel</Modal.CloseAction>
      </Modal.Actions>
    </Modal>
  )
}

export default RemoveWorkspace
