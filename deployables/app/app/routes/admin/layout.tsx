import { Page } from '@/components'
import { useWorkspaceId } from '@/workspaces'
import { Feature, TabBar } from '@zodiac/ui'
import { Blocks, Users } from 'lucide-react'
import { href, Outlet } from 'react-router'

const AdminLayout = () => {
  return (
    <Page>
      <Page.Header>Organization Settings</Page.Header>

      <Page.Main>
        <TabBar>
          <TabBar.LinkTab
            end
            icon={Users}
            to={href('/workspace/:workspaceId/admin', {
              workspaceId: useWorkspaceId(),
            })}
          >
            User management
          </TabBar.LinkTab>

          <Feature feature="workspaces">
            <TabBar.LinkTab
              icon={Blocks}
              to={href('/workspace/:workspaceId/admin/workspaces', {
                workspaceId: useWorkspaceId(),
              })}
            >
              Workspaces
            </TabBar.LinkTab>
          </Feature>
        </TabBar>

        <Outlet />
      </Page.Main>
    </Page>
  )
}

export default AdminLayout
