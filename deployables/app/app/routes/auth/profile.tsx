import { Page } from '@/components'
import { useIsPending } from '@/hooks'
import { authkitLoader } from '@workos-inc/authkit-react-router'
import { WorkOS } from '@workos-inc/node'
import { getString } from '@zodiac/form-data'
import { EmailInput, Form, PrimaryButton, TextInput } from '@zodiac/ui'
import type { Route } from './+types/profile'

export const loader = (args: Route.LoaderArgs) =>
  authkitLoader(args, { ensureSignedIn: true })

export const action = async ({ request }: Route.ActionArgs) => {
  const data = await request.formData()
  const workOS = new WorkOS()

  await workOS.userManagement.updateUser({
    userId: getString(data, 'userId'),
    firstName: getString(data, 'firstName'),
  })

  return null
}

const Profile = ({ loaderData: { user } }: Route.ComponentProps) => {
  return (
    <Page>
      <Page.Header>Profile</Page.Header>
      <Page.Main>
        <Form context={{ userId: user.id }}>
          <div className="grid grid-cols-2 gap-4">
            <TextInput
              required
              label="First name"
              name="firstName"
              defaultValue={user.firstName ?? ''}
            />
            <TextInput
              required
              label="Last name"
              defaultValue={user.lastName ?? ''}
            />

            <div className="col-span-2">
              <EmailInput readOnly label="Email" defaultValue={user.email} />
            </div>
          </div>

          <Form.Actions>
            <PrimaryButton busy={useIsPending()} submit>
              Update profile
            </PrimaryButton>
          </Form.Actions>
        </Form>
      </Page.Main>
    </Page>
  )
}

export default Profile
