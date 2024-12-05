import { Breadcrumbs, Page, PrimaryLinkButton } from '@/components'
import { useExecutionRoutes, useSelectedRouteId } from '@/execution-routes'
import { Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Route } from './Route'

export const ListRoutes = () => {
  const [, selectRoute] = useSelectedRouteId()
  const routes = useExecutionRoutes()
  const navigate = useNavigate()

  return (
    <Page>
      <Page.Header>
        <Breadcrumbs>
          <Breadcrumbs.Entry to="/">Transactions</Breadcrumbs.Entry>
        </Breadcrumbs>

        <h2 className="mt-1 text-xl">Pilot Routes</h2>
      </Page.Header>

      <Page.Content>
        {routes.map((route) => (
          <Route
            key={route.id}
            route={route}
            onLaunch={(routeId) => {
              selectRoute(routeId)

              navigate('/')
            }}
          />
        ))}
      </Page.Content>

      <Page.Footer>
        <PrimaryLinkButton fluid icon={Plus} to="new">
          Add route
        </PrimaryLinkButton>
      </Page.Footer>
    </Page>
  )
}
