import { Breadcrumbs, Divider, PrimaryButton } from '@/components'
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
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex flex-col gap-1 p-4">
        <Breadcrumbs>
          <Breadcrumbs.Entry to="/">Transactions</Breadcrumbs.Entry>
        </Breadcrumbs>

        <h2 className="text-xl">Pilot Routes</h2>
      </div>

      <Divider />

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
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
      </div>

      <Divider />

      <div className="flex p-4">
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
      </div>
    </div>
  )
}
