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
    <div className="flex flex-1 flex-col gap-4 px-4 py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl">Pilot Routes</h2>

        <Button
          onClick={() => {
            const newRouteId = nanoid()
            navigate('/routes/' + newRouteId)
          }}
          className="px-6 py-1"
        >
          Add Route
        </Button>
      </div>

      <Divider />

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
  )
}
