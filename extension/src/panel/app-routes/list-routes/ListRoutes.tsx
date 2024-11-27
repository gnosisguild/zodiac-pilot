import { Breadcrumbs, Page, PrimaryButton } from '@/components'
import { useSelectedRouteId, useZodiacRoutes } from '@/zodiac-routes'
import { Plus } from 'lucide-react'
import { nanoid } from 'nanoid'
import { useNavigate } from 'react-router-dom'
import { Route } from './Route'

export const ListRoutes = () => {
  const [, selectRoute] = useSelectedRouteId()
  const routes = useZodiacRoutes()
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
        <PrimaryButton
          fluid
          icon={Plus}
          onClick={() => {
            const newRouteId = nanoid()
            navigate('/routes/' + newRouteId)
          }}
        >
          Add Route
        </PrimaryButton>
      </Page.Footer>
    </Page>
  )
}
