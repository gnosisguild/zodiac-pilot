import { useIsPending } from '@zodiac/hooks'
import { CompanionAppMessageType, companionRequest } from '@zodiac/messages'
import { InlineForm, Modal, PrimaryButton } from '@zodiac/ui'
import { href, redirect, useNavigate } from 'react-router'
import type { Route } from './+types/delete-account'
import { Intent } from './intents'

export const clientAction = async ({
  params: { accountId, workspaceId },
}: Route.ClientActionArgs) => {
  const { promise, resolve } = Promise.withResolvers<void>()

  companionRequest(
    {
      type: CompanionAppMessageType.DELETE_ROUTE,
      routeId: accountId,
    },
    () => resolve(),
  )

  await promise

  return redirect(
    workspaceId == null
      ? href('/offline/accounts')
      : href('/workspace/:workspaceId/local-accounts', { workspaceId }),
  )
}

const DeleteLocalAccount = ({
  params: { workspaceId },
}: Route.ComponentProps) => {
  const navigate = useNavigate()

  return (
    <Modal
      open
      onClose={() =>
        navigate(
          workspaceId == null
            ? href('/offline/accounts')
            : href('/workspace/:workspaceId/local-accounts', { workspaceId }),
        )
      }
      title="Confirm delete"
      description="Are you sure you want to delete this account? This action cannot be undone."
    >
      <Modal.Actions>
        <InlineForm>
          <PrimaryButton
            submit
            name="routeId"
            intent={Intent.Delete}
            busy={useIsPending(Intent.Delete)}
          >
            Delete
          </PrimaryButton>
        </InlineForm>

        <Modal.CloseAction>Cancel</Modal.CloseAction>
      </Modal.Actions>
    </Modal>
  )
}

export default DeleteLocalAccount
