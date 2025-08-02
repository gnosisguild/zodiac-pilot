import { Info, SecondaryLinkButton } from '@zodiac/ui'
import { href, Outlet } from 'react-router'
import type { Route } from './+types/no-routes'

const NoRoutes = ({
  params: { workspaceId, accountId },
}: Route.ComponentProps) => {
  return (
    <div className="flex justify-center py-16">
      <Info title="No routes">
        You have not defined any routes leading to this account, yet.
        <Info.Actions>
          <SecondaryLinkButton
            replace
            size="small"
            to={href(
              '/workspace/:workspaceId/accounts/:accountId/no-routes/add',
              { workspaceId, accountId },
            )}
          >
            Add route
          </SecondaryLinkButton>
        </Info.Actions>
      </Info>

      <Outlet />
    </div>
  )
}

export default NoRoutes
