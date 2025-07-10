import { authorizedAction, authorizedLoader } from '@/auth-server'
import { invariantResponse } from '@epic-web/invariant'
import {
  dbClient,
  getAccount,
  getWorkspace,
  getWorkspaces,
  moveAccount,
} from '@zodiac/db'
import { getUUID } from '@zodiac/form-data'
import { useIsPending } from '@zodiac/hooks'
import { isUUID } from '@zodiac/schema'
import { Form, Modal, PrimaryButton, Select } from '@zodiac/ui'
import { href, redirect, useNavigate } from 'react-router'
import type { Route } from './+types/move-account'
import { Intent } from './intents'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({
      context: {
        auth: { tenant },
      },
      params: { workspaceId },
    }) => {
      const workspaces = await getWorkspaces(dbClient(), {
        tenantId: tenant.id,
      })

      return {
        workspaces: workspaces.filter(
          (workspace) => workspace.id !== workspaceId,
        ),
      }
    },
    {
      ensureSignedIn: true,
      async hasAccess({ tenant, params: { workspaceId } }) {
        invariantResponse(isUUID(workspaceId), '"workspaceId" is not a UUID')

        const workspace = await getWorkspace(dbClient(), workspaceId)

        return workspace.tenantId === tenant.id
      },
    },
  )

export const action = (args: Route.ActionArgs) =>
  authorizedAction(
    args,
    async ({ request, params: { accountId, workspaceId } }) => {
      invariantResponse(isUUID(accountId), '"accountId" is not a UUID')

      const data = await request.formData()

      await moveAccount(dbClient(), {
        accountId,
        targetWorkspaceId: getUUID(data, 'targetWorkspaceId'),
      })

      return redirect(href('/workspace/:workspaceId/accounts', { workspaceId }))
    },
    {
      ensureSignedIn: true,
      async hasAccess({ request, tenant, params: { accountId } }) {
        invariantResponse(isUUID(accountId), '"accountId" is not a UUID')

        const data = await request.formData()

        const [account, targetWorkspace] = await Promise.all([
          getAccount(dbClient(), accountId),
          getWorkspace(dbClient(), getUUID(data, 'targetWorkspaceId')),
        ])

        return (
          account.tenantId === tenant.id &&
          targetWorkspace.tenantId === tenant.id
        )
      },
    },
  )

const MoveAccount = ({
  params: { workspaceId },
  loaderData: { workspaces },
}: Route.ComponentProps) => {
  const navigate = useNavigate()

  return (
    <Modal
      open
      title="Move account"
      description="Please select the workspace this account should be moved into. You can always move it back later if you need to."
      onClose={() =>
        navigate(href('/workspace/:workspaceId/accounts', { workspaceId }))
      }
    >
      <Form>
        <Select
          required
          label="Target workspace"
          name="targetWorkspaceId"
          options={workspaces.map((workspace) => ({
            value: workspace.id,
            label: workspace.label,
          }))}
        />

        <Modal.Actions>
          <PrimaryButton
            submit
            intent={Intent.MoveAccount}
            busy={useIsPending(Intent.MoveAccount)}
          >
            Move
          </PrimaryButton>

          <Modal.CloseAction>Cancel</Modal.CloseAction>
        </Modal.Actions>
      </Form>
    </Modal>
  )
}

export default MoveAccount
