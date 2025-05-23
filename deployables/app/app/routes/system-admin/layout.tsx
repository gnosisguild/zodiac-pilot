import { Navigation } from '@/components'
import {
  GhostLinkButton,
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarLayout,
} from '@zodiac/ui'
import {
  ArrowLeft,
  Building2,
  ListTodo,
  SquareKanban,
  Users,
} from 'lucide-react'
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

              <Navigation.Link to={href('/system-admin/users')} icon={Users}>
                Users
              </Navigation.Link>
            </Navigation.Section>

            <Navigation.Section title="System management">
              <Navigation.Link
                to={href('/system-admin/subscriptionPlans')}
                icon={SquareKanban}
              >
                Plans
              </Navigation.Link>
              <Navigation.Link
                to={href('/system-admin/features')}
                icon={ListTodo}
              >
                Features
              </Navigation.Link>
            </Navigation.Section>
          </Navigation>
        </SidebarBody>

        <SidebarFooter>
          <GhostLinkButton fluid to={href('/')} icon={ArrowLeft}>
            Back to app
          </GhostLinkButton>
        </SidebarFooter>
      </Sidebar>
    }
  >
    <Outlet />
  </SidebarLayout>
)

export default SystemAdminLayout
