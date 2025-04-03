import { Page } from '@/components'
import { useIsPending } from '@/hooks'
import { Widgets } from '@/workOS/client'
import { authkitLoader, signOut } from '@workos-inc/authkit-react-router'
import { UserProfile, UserSecurity, UserSessions } from '@workos-inc/widgets'
import { Form, SecondaryButton } from '@zodiac/ui'
import type { Route } from './+types/profile'

export const loader = (args: Route.LoaderArgs) => {
  return authkitLoader(args, { ensureSignedIn: true })
}

export const action = async ({ request }: Route.ActionArgs) => {
  return await signOut(request)
}

const Profile = ({
  loaderData: { accessToken, sessionId },
}: Route.ComponentProps) => {
  const signingOut = useIsPending()

  return (
    <Page>
      <Page.Header>Profile</Page.Header>
      <Page.Main>
        <Widgets>
          <Form>
            <Form.Section title="Personal information">
              <UserProfile authToken={accessToken} />
            </Form.Section>

            <Form.Section title="Security">
              <UserSecurity authToken={accessToken} />
            </Form.Section>

            <Form.Section title="Sessions">
              <UserSessions
                authToken={accessToken}
                currentSessionId={sessionId}
              />
            </Form.Section>

            <Form.Actions>
              <SecondaryButton submit busy={signingOut} style="critical">
                Sign out
              </SecondaryButton>
            </Form.Actions>
          </Form>
        </Widgets>
      </Page.Main>
    </Page>
  )
}

export default Profile
