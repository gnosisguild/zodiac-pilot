import { Page } from '@/components'
import { SecondaryLinkButton, TabBar } from '@zodiac/ui'
import { href, Outlet } from 'react-router'
import { Route } from './+types/list-layout'

const RoleListLayout = ({ params: { workspaceId } }: Route.ComponentProps) => {
  return (
    <Page>
      <Page.Header
        action={
          <SecondaryLinkButton
            to={href('/workspace/:workspaceId/roles/create', { workspaceId })}
          >
            Create new role
          </SecondaryLinkButton>
        }
      >
        Roles
      </Page.Header>

      <Page.Main>
        <TabBar>
          <TabBar.LinkTab
            end
            to={href('/workspace/:workspaceId/roles', { workspaceId })}
          >
            Managed
          </TabBar.LinkTab>

          <TabBar.LinkTab
            to={href('/workspace/:workspaceId/roles/drafts', { workspaceId })}
          >
            Drafts
          </TabBar.LinkTab>

          <TabBar.LinkTab
            to={href('/workspace/:workspaceId/roles/on-chain', { workspaceId })}
          >
            On-Chain only
          </TabBar.LinkTab>
        </TabBar>

        <Outlet />
      </Page.Main>
    </Page>
  )
}

export default RoleListLayout
