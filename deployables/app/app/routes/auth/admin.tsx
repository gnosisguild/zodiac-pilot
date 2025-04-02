import { Page } from '@/components'
import { Widgets } from '@/workOS/client'
import { invariantResponse } from '@epic-web/invariant'
import { authkitLoader } from '@workos-inc/authkit-react-router'
import { UsersManagement } from '@workos-inc/widgets'
import type { Route } from './+types/admin'

export const loader = (args: Route.LoaderArgs) =>
  authkitLoader(
    args,
    ({ auth: { role } }) => {
      invariantResponse(role === 'admin', 'User is no admin')

      return {}
    },
    { ensureSignedIn: true },
  )

const OrganizationAdmin = ({
  loaderData: { accessToken },
}: Route.ComponentProps) => {
  return (
    <Page>
      <Page.Header>Administration</Page.Header>
      <Page.Main>
        <Widgets>
          <UsersManagement authToken={accessToken} />
        </Widgets>
      </Page.Main>
    </Page>
  )
}

export default OrganizationAdmin
