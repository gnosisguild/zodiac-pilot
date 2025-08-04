import { authorizedLoader } from '@/auth-server'
import { Widgets } from '@/workOS/client'
import { UsersManagement } from '@workos-inc/widgets'
import type { Route } from './+types/users'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    ({
      context: {
        auth: { accessToken },
      },
    }) => {
      return { accessToken }
    },
    {
      ensureSignedIn: true,
      hasAccess({ role }) {
        return role === 'admin'
      },
    },
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
