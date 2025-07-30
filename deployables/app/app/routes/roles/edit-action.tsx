import { authorizedAction, authorizedLoader } from '@/auth-server'
import { invariantResponse } from '@epic-web/invariant'
import { dbClient, getRoleAction, updateRoleAction } from '@zodiac/db'
import { getString } from '@zodiac/form-data'
import { useIsPending } from '@zodiac/hooks'
import { isUUID } from '@zodiac/schema'
import { Form, Modal, PrimaryButton, TextInput } from '@zodiac/ui'
import { href, redirect, useNavigate } from 'react-router'
import { Route } from './+types/edit-action'
import { Intent } from './intents'
import { RoleActionTypeSelect } from './RoleActionTypeSelect'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({ params: { actionId } }) => {
      invariantResponse(isUUID(actionId), '"actionId" is not a UUID')

      return { action: await getRoleAction(dbClient(), actionId) }
    },
    {
      ensureSignedIn: true,
      async hasAccess({ params: { workspaceId, roleId, actionId }, tenant }) {
        invariantResponse(isUUID(actionId), '"actionId" is not a UUID')

        const action = await getRoleAction(dbClient(), actionId)

        return (
          action.tenantId === tenant.id &&
          action.workspaceId === workspaceId &&
          action.roleId === roleId
        )
      },
    },
  )

export const action = (args: Route.ActionArgs) =>
  authorizedAction(
    args,
    async ({ request, params: { workspaceId, roleId, actionId } }) => {
      const data = await request.formData()

      invariantResponse(isUUID(actionId), '"actionId" is not a UUID')

      const action = await getRoleAction(dbClient(), actionId)

      const label = getString(data, 'label')

      if (action.label !== label) {
        await updateRoleAction(dbClient(), action, {
          label,
        })
      }

      return redirect(
        href('/workspace/:workspaceId/roles/:roleId', { workspaceId, roleId }),
      )
    },
    {
      ensureSignedIn: true,
      async hasAccess({ params: { workspaceId, roleId, actionId }, tenant }) {
        invariantResponse(isUUID(actionId), '"actionId" is not a UUID')

        const action = await getRoleAction(dbClient(), actionId)

        return (
          action.tenantId === tenant.id &&
          action.workspaceId === workspaceId &&
          action.roleId === roleId
        )
      },
    },
  )

const EditAction = ({
  loaderData: { action },
  params: { workspaceId, roleId },
}: Route.ComponentProps) => {
  const navigate = useNavigate()

  return (
    <Modal
      open
      onClose={() =>
        navigate(
          href('/workspace/:workspaceId/roles/:roleId', {
            workspaceId,
            roleId,
          }),
        )
      }
    >
      <Form>
        <TextInput
          required
          label="Action label"
          name="label"
          defaultValue={action.label}
        />

        <RoleActionTypeSelect />

        <Modal.Actions>
          <PrimaryButton
            submit
            intent={Intent.EditAction}
            busy={useIsPending(Intent.EditAction)}
          >
            Update
          </PrimaryButton>
          <Modal.CloseAction>Cancel</Modal.CloseAction>
        </Modal.Actions>
      </Form>
    </Modal>
  )
}

export default EditAction
