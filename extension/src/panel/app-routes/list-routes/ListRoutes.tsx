import { Button, Divider } from '@/components'
import { useSelectedRouteId, useZodiacRoutes } from '@/zodiac-routes'
import { nanoid } from 'nanoid'
import { useNavigate } from 'react-router-dom'
import { Route } from './Route'

export const ListRoutes = () => {
  const [, selectRoute] = useSelectedRouteId()
  const routes = useZodiacRoutes()
  const navigate = useNavigate()

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <h2 className="p-4 text-xl">Pilot Routes</h2>

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
            onModify={(routeId) => {
              navigate('/routes/' + routeId)
            }}
          />
        ))}
      </div>

      <Divider />

      <div className="flex p-4">
        <Button
          fluid
          onClick={() => {
            const newRouteId = nanoid()
            navigate('/routes/' + newRouteId)
          }}
        >
          Add Route
        </Button>
      </div>
    </div>
  )
}
