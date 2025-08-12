import { authorizedAction, authorizedLoader } from '@/auth-server'
import { invariantResponse } from '@epic-web/invariant'
import {
  dbClient,
  getWorkspace,
  getWorkspaces,
  moveAccounts,
  removeWorkspace,
} from '@zodiac/db'
import { getUUID } from '@zodiac/form-data'
import { useIsPending } from '@zodiac/hooks'
import { isUUID } from '@zodiac/schema'
import { Form, Modal, PrimaryButton, Select } from '@zodiac/ui'
import { href, redirect, useNavigate } from 'react-router'
import type { Route } from './+types/remove-workspace'
import { Intent } from './intents'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({
      params: { id },
      context: {
        auth: { tenant },
      },
    }) => {
      invariantResponse(isUUID(id), '"id" is not a UUID')

      const workspaces = await getWorkspaces(dbClient(), {
        tenantId: tenant.id,
      })

      return {
        defaultWorkspace: await getWorkspace(
          dbClient(),
          tenant.defaultWorkspaceId,
        ),
        workspaces: workspaces.filter((workspace) => workspace.id !== id),
      }
    },
    {
      ensureSignedIn: true,
      async hasAccess({ tenant, params: { id }, role }) {
        invariantResponse(isUUID(id), '"id" is not a UUID')

        const workspace = await getWorkspace(dbClient(), id)

        return (
          role === 'admin' &&
          workspace.tenantId === tenant.id &&
          workspace.id !== tenant.defaultWorkspaceId
        )
      },
    },
  )

export const action = (args: Route.ActionArgs) =>
  authorizedAction(
    args,
    async ({
      request,
      params: { id, workspaceId },
      context: {
        auth: { user, tenant },
      },
    }) => {
      invariantResponse(isUUID(id), '"id" is not a UUID')

      const data = await request.formData()

      const targetWorkspaceId = getUUID(data, 'targetWorkspaceId')

      await dbClient().transaction(async (tx) => {
        await removeWorkspace(tx, user, id)

        await moveAccounts(tx, { originWorkspaceId: id, targetWorkspaceId })
      })

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
      async hasAccess({ request, tenant, params: { id }, role }) {
        invariantResponse(isUUID(id), '"id" is not a UUID')

        const data = await request.formData()

        const targetWorkspaceId = getUUID(data, 'targetWorkspaceId')

        const [workspace, targetWorkspace] = await Promise.all([
          getWorkspace(dbClient(), id),
          getWorkspace(dbClient(), targetWorkspaceId),
        ])

        return (
          role === 'admin' &&
          workspace.tenantId === tenant.id &&
          workspace.id !== tenant.defaultWorkspaceId &&
          targetWorkspace.tenantId === tenant.id
        )
      },
    },
  )

const RemoveWorkspace = ({
  params: { workspaceId },
  loaderData: { workspaces, defaultWorkspace },
}: Route.ComponentProps) => {
  const navigate = useNavigate()

  return (
    <Modal
      open
      title="Remove workspace"
      description="Are you sure you want to remove this workspace? This action cannot be
        undone."
      onClose={() =>
        navigate(
          href('/workspace/:workspaceId/admin/workspaces', { workspaceId }),
          { replace: true },
        )
      }
    >
      <Form replace>
        <Select
          label="Move accounts to"
          name="targetWorkspaceId"
          defaultValue={defaultWorkspace.id}
          options={workspaces.map((workspace) => ({
            label: workspace.label,
            value: workspace.id,
          }))}
        />
        <Modal.Actions>
          <PrimaryButton
            submit
            style="critical"
            intent={Intent.RemoveWorkspace}
            busy={useIsPending(Intent.RemoveWorkspace)}
          >
            Remove
          </PrimaryButton>

          <Modal.CloseAction>Cancel</Modal.CloseAction>
        </Modal.Actions>
      </Form>
    </Modal>
  )
}

export default RemoveWorkspace
