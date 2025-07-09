import { authorizedAction } from '@/auth-server'
import { invariantResponse } from '@epic-web/invariant'
import { dbClient, deleteAccount, getAccount, getWorkspace } from '@zodiac/db'
import { useIsPending } from '@zodiac/hooks'
import { isUUID } from '@zodiac/schema'
import { InlineForm, Modal, PrimaryButton } from '@zodiac/ui'
import { href, redirect, useNavigate } from 'react-router'
import type { Route } from './+types/delete-account'
import { Intent } from './intents'

export const action = async (args: Route.ActionArgs) =>
  authorizedAction(
    args,
    async ({
      context: {
        auth: { user },
      },
      params: { accountId, workspaceId },
    }) => {
      invariantResponse(isUUID(accountId), '"accountId" is not a UUID"')

      await deleteAccount(dbClient(), user, accountId)

      return redirect(href('/workspace/:workspaceId/accounts', { workspaceId }))
    },
    {
      ensureSignedIn: true,
      async hasAccess({ user, tenant, params: { workspaceId, accountId } }) {
        invariantResponse(isUUID(workspaceId), '"workspaceId" is not a UUID"')
        invariantResponse(isUUID(accountId), '"accountId" is not a UUID"')

        const workspace = await getWorkspace(dbClient(), workspaceId)

        if (workspace.tenantId !== tenant.id) {
          return false
        }

        const account = await getAccount(dbClient(), accountId)

        return account.createdById === user.id
      },
    },
  )

const DeleteAccount = ({ params: { workspaceId } }: Route.ComponentProps) => {
  const navigate = useNavigate()

  return (
    <Modal
      title="Confirm delete"
      description="Are you sure you want to delete this account? This action cannot be
      undone."
      open
      onClose={() =>
        navigate(href('/workspace/:workspaceId/accounts', { workspaceId }))
      }
    >
      <Modal.Actions>
        <InlineForm>
          <PrimaryButton
            submit
            intent={Intent.DeleteAccount}
            busy={useIsPending(Intent.DeleteAccount)}
            style="critical"
          >
            Delete
          </PrimaryButton>
        </InlineForm>
        <Modal.CloseAction>Cancel</Modal.CloseAction>
      </Modal.Actions>
    </Modal>
  )
}

export default DeleteAccount
