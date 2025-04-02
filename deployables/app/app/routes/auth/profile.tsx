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
          <UserProfile authToken={accessToken} />

          <h2 className="mb-8 mt-16 text-2xl">Security</h2>
          <UserSecurity authToken={accessToken} />

          <h2 className="mb-8 mt-16 text-2xl">Sessions</h2>
          <UserSessions authToken={accessToken} currentSessionId={sessionId} />

          <Form>
            <Form.Actions align="left">
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
