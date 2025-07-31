import { authorizedAction } from '@/auth-server'
import { invariantResponse } from '@epic-web/invariant'
import { createRoleAction, dbClient, getRole } from '@zodiac/db'
import { RoleActionType } from '@zodiac/db/schema'
import { getString } from '@zodiac/form-data'
import { useIsPending } from '@zodiac/hooks'
import { isUUID } from '@zodiac/schema'
import { Form, Modal, PrimaryButton, TextInput } from '@zodiac/ui'
import { href, redirect, useNavigate } from 'react-router'
import { Route } from './+types/add-action'
import { Intent } from './intents'
import { RoleActionTypeSelect } from './RoleActionTypeSelect'

export const action = (args: Route.ActionArgs) =>
  authorizedAction(
    args,
    async ({
      request,
      params: { roleId, workspaceId },
      context: {
        auth: { user },
      },
    }) => {
      invariantResponse(isUUID(roleId), '"roleId" is not a UUID')

      const data = await request.formData()
      const role = await getRole(dbClient(), roleId)

      await createRoleAction(dbClient(), role, user, {
        label: getString(data, 'label'),
        type: RoleActionType.Swapper,
      })

      return redirect(
        href('/workspace/:workspaceId/roles/:roleId', { workspaceId, roleId }),
      )
    },
    {
      ensureSignedIn: true,
      async hasAccess({ tenant, params: { workspaceId, roleId } }) {
        invariantResponse(isUUID(roleId), '"roleId" is not a UUID')

        const role = await getRole(dbClient(), roleId)

        return role.tenantId === tenant.id && role.workspaceId === workspaceId
      },
    },
  )

const AddAction = ({
  params: { workspaceId, roleId },
}: Route.ComponentProps) => {
  const navigate = useNavigate()

  return (
    <Modal
      open
      title="Add action"
      onClose={() =>
        navigate(
          href('/workspace/:workspaceId/roles/:roleId', {
            workspaceId,
            roleId,
          }),
          { replace: true },
        )
      }
    >
      <Form replace>
        <TextInput required label="Action label" name="label" />

        <RoleActionTypeSelect />

        <Modal.Actions>
          <PrimaryButton
            submit
            intent={Intent.AddAction}
            busy={useIsPending(Intent.AddAction)}
          >
            Add
          </PrimaryButton>
          <Modal.CloseAction>Cancel</Modal.CloseAction>
        </Modal.Actions>
      </Form>
    </Modal>
  )
}

export default AddAction
