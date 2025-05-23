import { authorizedAction } from '@/auth-server'
import { createSubscriptionPlan, dbClient } from '@zodiac/db'
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

      await createSubscriptionPlan(dbClient(), getString(data, 'name'))

      return redirect(href('/system-admin/subscriptionPlans'))
    },
    {
      ensureSignedIn: true,
      hasAccess({ isSystemAdmin }) {
        return isSystemAdmin
      },
    },
  )

const CreateSubscriptionPlan = () => {
  const navigate = useNavigate()

  return (
    <Modal
      open
      title="Add new plan"
      onClose={() => navigate(href('/system-admin/subscriptionPlans'))}
    >
      <Form>
        <TextInput required label="Name" name="name" />

        <Modal.Actions>
          <PrimaryButton
            submit
            intent={Intent.Create}
            busy={useIsPending(Intent.Create)}
          >
            Add
          </PrimaryButton>
          <Modal.CloseAction>Cancel</Modal.CloseAction>
        </Modal.Actions>
      </Form>
    </Modal>
  )
}

export default CreateSubscriptionPlan

enum Intent {
  Create = 'Create',
}
