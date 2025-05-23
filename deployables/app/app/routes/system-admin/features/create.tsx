import { authorizedAction } from '@/auth-server'
import { createFeature, dbClient } from '@zodiac/db'
import { getString } from '@zodiac/form-data'
import { useIsPending } from '@zodiac/hooks'
import { Form, Modal, PrimaryButton, TextInput } from '@zodiac/ui'
import { href, redirect, useNavigate } from 'react-router'
import type { Route } from './+types/create'

export const action = (args: Route.ActionArgs) =>
  authorizedAction(
    args,
    async ({ request }) => {
      const data = await request.formData()

      await createFeature(dbClient(), getString(data, 'name'))

      return redirect(href('/system-admin/features'))
    },
    {
      ensureSignedIn: true,
      hasAccess({ isSystemAdmin }) {
        return isSystemAdmin
      },
    },
  )

const CreateFeature = () => {
  const navigate = useNavigate()

  return (
    <Modal
      open
      title="New feature"
      onClose={() => navigate(href('/system-admin/features'))}
    >
      <Form>
        <TextInput label="Name" name="name" />

        <Modal.Actions>
          <PrimaryButton
            submit
            intent={Intent.Create}
            busy={useIsPending(Intent.Create)}
          >
            Create
          </PrimaryButton>

          <Modal.CloseAction>Cancel</Modal.CloseAction>
        </Modal.Actions>
      </Form>
    </Modal>
  )
}

export default CreateFeature

enum Intent {
  Create = 'Create',
}
