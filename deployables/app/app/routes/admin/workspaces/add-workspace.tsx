import { authorizedAction } from '@/auth-server'
import { createWorkspace, dbClient } from '@zodiac/db'
import { getString } from '@zodiac/form-data'
import { useIsPending } from '@zodiac/hooks'
import { Form, Modal, PrimaryButton, TextInput } from '@zodiac/ui'
import { href, redirect, useNavigate } from 'react-router'
import type { Route } from './+types/add-workspace'
import { Intent } from './intents'

export const action = (args: Route.ActionArgs) =>
  authorizedAction(
    args,
    async ({
      request,
      context: {
        auth: { tenant, user },
      },
      params: { workspaceId },
    }) => {
      const data = await request.formData()

      await createWorkspace(dbClient(), {
        tenant,
        createdBy: user,
        label: getString(data, 'label'),
      })

      return redirect(
        href('/workspace/:workspaceId/admin/workspaces', { workspaceId }),
      )
    },
    {
      ensureSignedIn: true,
      hasAccess({ role }) {
        return role === 'admin'
      },
    },
  )

const AddWorkspace = ({ params: { workspaceId } }: Route.ComponentProps) => {
  const navigate = useNavigate()

  return (
    <Modal
      open
      title="Add new workspace"
      onClose={() =>
        navigate(
          href('/workspace/:workspaceId/admin/workspaces', {
            workspaceId,
          }),
        )
      }
    >
      <Form>
        <TextInput
          required
          label="Label"
          name="label"
          placeholder="New workspace"
        />

        <Modal.Actions>
          <PrimaryButton
            submit
            intent={Intent.AddWorkspace}
            busy={useIsPending(Intent.AddWorkspace)}
          >
            Add
          </PrimaryButton>
          <Modal.CloseAction>Cancel</Modal.CloseAction>
        </Modal.Actions>
      </Form>
    </Modal>
  )
}

export default AddWorkspace
