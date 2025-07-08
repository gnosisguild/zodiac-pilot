import { Widgets } from '@/workOS/client'
import { invariantResponse } from '@epic-web/invariant'
import { authkitLoader } from '@workos-inc/authkit-react-router'
import { UsersManagement } from '@workos-inc/widgets'
import type { Route } from './+types/users'

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
    <Widgets>
      <UsersManagement authToken={accessToken} />
    </Widgets>
  )
}

export default OrganizationAdmin
