import { Page } from '@/components'
import { useWorkspaceId } from '@/workspaces'
import { TabBar } from '@zodiac/ui'
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

          <TabBar.LinkTab
            icon={Blocks}
            to={href('/workspace/:workspaceId/admin/workspaces', {
              workspaceId: useWorkspaceId(),
            })}
          >
            Workspaces
          </TabBar.LinkTab>
        </TabBar>

        <Outlet />
      </Page.Main>
    </Page>
  )
}

export default AdminLayout
