import { Breadcrumbs, Page, PrimaryButton } from '@/components'
import { getRoutes } from '@/execution-routes'
import { Plus } from 'lucide-react'
import { nanoid } from 'nanoid'
import { useLoaderData, useNavigate } from 'react-router-dom'
import { Route } from './Route'

export const loader = async () => {
  return {
    routes: await getRoutes(),
  }
}

export const ListRoutes = () => {
  const navigate = useNavigate()
  const { routes } = useLoaderData<typeof loader>()

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
            onLaunch={(routeId) => navigate(`/${routeId}`)}
          />
        ))}
      </Page.Content>

      <Page.Footer>
        <PrimaryButton
          fluid
          icon={Plus}
          onClick={() => {
            const newRouteId = nanoid()
            navigate('routes/' + newRouteId)
          }}
        >
          Add Route
        </PrimaryButton>
      </Page.Footer>
    </Page>
  )
}
