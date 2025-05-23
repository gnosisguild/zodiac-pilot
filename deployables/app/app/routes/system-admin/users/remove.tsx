import { authorizedAction, authorizedLoader } from '@/auth-server'
import { getUser, removeUser } from '@/workOS/server'
import { invariantResponse } from '@epic-web/invariant'
import { getString } from '@zodiac/form-data'
import { useIsPending } from '@zodiac/hooks'
import { Form, Modal, PrimaryButton, TextInput } from '@zodiac/ui'
import { href, redirect, useNavigate } from 'react-router'
import type { Route } from './+types/remove'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({ params: { workOsUserId } }) => {
      return {
        user: await getUser(workOsUserId),
      }
    },
    {
      ensureSignedIn: true,
      hasAccess({ isSystemAdmin }) {
        return isSystemAdmin
      },
    },
  )

export const action = (args: Route.ActionArgs) =>
  authorizedAction(
    args,
    async ({ request, params: { workOsUserId } }) => {
      const data = await request.formData()

      invariantResponse(
        getString(data, 'confirmation') === 'DELETE USER',
        'Confirmation does not match',
      )

      await removeUser(workOsUserId)

      return redirect(href('/system-admin/users'))
    },
    {
      ensureSignedIn: true,
      hasAccess({ isSystemAdmin }) {
        return isSystemAdmin
      },
    },
  )

const RemoveUser = ({ loaderData: { user } }: Route.ComponentProps) => {
  const navigate = useNavigate()

  return (
    <Modal
      open
      onClose={() => navigate(href('/system-admin/users'))}
      title="Remove Work OS user"
    >
      You are about to delete the user "{user.firstName} {user.lastName}". If
      that is what you want type <strong>DELETE USER</strong> in the field
      below.
      <Form>
        <TextInput
          name="confirmation"
          label="Confirmation"
          placeholder="DELETE USER"
        />

        <Modal.Actions>
          <PrimaryButton
            submit
            style="critical"
            intent={Intent.Remove}
            busy={useIsPending(Intent.Remove)}
          >
            Remove
          </PrimaryButton>
          <Modal.CloseAction>Cancel</Modal.CloseAction>
        </Modal.Actions>
      </Form>
    </Modal>
  )
}

export default RemoveUser

enum Intent {
  Remove = 'Remove',
}
