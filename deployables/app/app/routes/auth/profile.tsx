import { Page } from '@/components'
import '@radix-ui/themes/styles.css'
import { authkitLoader } from '@workos-inc/authkit-react-router'
import { WorkOS } from '@workos-inc/node'
import {
  UserProfile,
  UserSecurity,
  UserSessions,
  WorkOsWidgets,
} from '@workos-inc/widgets'
import '@workos-inc/widgets/styles.css'
import { getString } from '@zodiac/form-data'
import { useEffect, useState } from 'react'
import type { Route } from './+types/profile'

export const loader = (args: Route.LoaderArgs) => {
  return authkitLoader(args, { ensureSignedIn: true })
}

export const action = async ({ request }: Route.ActionArgs) => {
  const data = await request.formData()
  const workOS = new WorkOS()

  await workOS.userManagement.updateUser({
    userId: getString(data, 'userId'),
    firstName: getString(data, 'firstName'),
  })

  return null
}

const Profile = ({
  loaderData: { accessToken, sessionId },
}: Route.ComponentProps) => {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const result = window.matchMedia('(prefers-color-scheme: dark)')

    const handleDarkChange = (result: MediaQueryListEvent) => {
      setDark(result.matches)
    }

    result.addEventListener('change', handleDarkChange)

    setDark(result.matches)

    return () => {
      result.removeEventListener('change', handleDarkChange)
    }
  }, [])

  return (
    <Page>
      <Page.Header>Profile</Page.Header>
      <Page.Main>
        {WorkOsWidgets != null && (
          <WorkOsWidgets
            theme={{
              appearance: dark ? 'dark' : 'light',
              hasBackground: false,
              accentColor: dark ? 'teal' : 'indigo',
            }}
          >
            <UserProfile authToken={accessToken} />

            <h2 className="mb-8 mt-16 text-2xl">Security</h2>
            <UserSecurity authToken={accessToken} />

            <h2 className="mb-8 mt-16 text-2xl">Sessions</h2>
            <UserSessions
              authToken={accessToken}
              currentSessionId={sessionId}
            />
          </WorkOsWidgets>
        )}
      </Page.Main>
    </Page>
  )
}

export default Profile
