import { Navigation } from '@/components'
import { Sidebar, SidebarBody, SidebarLayout } from '@zodiac/ui'
import { Building2 } from 'lucide-react'
import { href, Outlet } from 'react-router'

const SystemAdminLayout = () => (
  <SidebarLayout
    navbar={null}
    sidebar={
      <Sidebar>
        <SidebarBody>
          <Navigation>
            <Navigation.Section title="User management">
              <Navigation.Link
                to={href('/system-admin/tenants')}
                icon={Building2}
              >
                Tenants
              </Navigation.Link>
            </Navigation.Section>
          </Navigation>
        </SidebarBody>
      </Sidebar>
    }
  >
    <Outlet />
  </SidebarLayout>
)

export default SystemAdminLayout
