import { authorizedAction, authorizedLoader } from '@/auth-server'
import { invariantResponse } from '@epic-web/invariant'
import { dbClient, getWorkspace, updateWorkspaceLabel } from '@zodiac/db'
import { getString } from '@zodiac/form-data'
import { useIsPending } from '@zodiac/hooks'
import { isUUID } from '@zodiac/schema'
import { Form, Modal, PrimaryButton, TextInput } from '@zodiac/ui'
import { href, redirect, useNavigate } from 'react-router'
import type { Route } from './+types/edit-workspace'
import { Intent } from './intents'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({ params: { id } }) => {
      invariantResponse(isUUID(id), '"id" is not a UUID')

      const workspace = await getWorkspace(dbClient(), id)

      return { label: workspace.label }
    },
    {
      ensureSignedIn: true,
      async hasAccess({ role, tenant, params: { id } }) {
        invariantResponse(isUUID(id), '"id" is not a UUID')

        const workspace = await getWorkspace(dbClient(), id)

        return role === 'admin' && workspace.tenantId === tenant.id
      },
    },
  )

export const action = (args: Route.ActionArgs) =>
  authorizedAction(
    args,
    async ({ request, params: { id, workspaceId } }) => {
      invariantResponse(isUUID(id), '"id" is not a UUID')

      const data = await request.formData()

      const label = getString(data, 'label')

      await updateWorkspaceLabel(dbClient(), id, label)

      return redirect(
        href('/workspace/:workspaceId/admin/workspaces', { workspaceId }),
      )
    },
    {
      ensureSignedIn: true,
      async hasAccess({ role, tenant, params: { id } }) {
        invariantResponse(isUUID(id), '"id" is not a UUID')

        const workspace = await getWorkspace(dbClient(), id)

        return role === 'admin' && workspace.tenantId === tenant.id
      },
    },
  )

const EditWorkspace = ({
  params: { workspaceId },
  loaderData: { label },
}: Route.ComponentProps) => {
  const navigate = useNavigate()

  return (
    <Modal
      open
      title="Edit workspace"
      onClose={() =>
        navigate(
          href('/workspace/:workspaceId/admin/workspaces', { workspaceId }),
        )
      }
    >
      <Form>
        <TextInput required label="Label" name="label" defaultValue={label} />

        <Modal.Actions>
          <PrimaryButton
            submit
            intent={Intent.EditWorkspace}
            busy={useIsPending(Intent.EditWorkspace)}
          >
            Save
          </PrimaryButton>

          <Modal.CloseAction>Cancel</Modal.CloseAction>
        </Modal.Actions>
      </Form>
    </Modal>
  )
}

export default EditWorkspace
