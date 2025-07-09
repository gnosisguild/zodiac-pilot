import { authorizedAction } from '@/auth-server'
import { invariantResponse } from '@epic-web/invariant'
import { dbClient, getWorkspace, removeWorkspace } from '@zodiac/db'
import { useIsPending } from '@zodiac/hooks'
import { isUUID } from '@zodiac/schema'
import { InlineForm, Modal, PrimaryButton } from '@zodiac/ui'
import { href, redirect, useNavigate } from 'react-router'
import type { Route } from './+types/remove-workspace'
import { Intent } from './intents'

export const action = (args: Route.ActionArgs) =>
  authorizedAction(
    args,
    async ({
      params: { id, workspaceId },
      context: {
        auth: { user, tenant },
      },
    }) => {
      invariantResponse(isUUID(id), '"id" is not a UUID')

      await removeWorkspace(dbClient(), user, id)

      if (workspaceId === id) {
        return redirect(
          href('/workspace/:workspaceId/admin/workspaces', {
            workspaceId: tenant.defaultWorkspaceId,
          }),
        )
      }

      return redirect(
        href('/workspace/:workspaceId/admin/workspaces', { workspaceId }),
      )
    },
    {
      ensureSignedIn: true,
      async hasAccess({ tenant, params: { id }, role }) {
        invariantResponse(isUUID(id), '"id" is not a UUID')

        const workspace = await getWorkspace(dbClient(), id)

        return role === 'admin' && workspace.tenantId === tenant.id
      },
    },
  )

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
            style="critical"
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
