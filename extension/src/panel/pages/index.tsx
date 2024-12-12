import { getRoutes } from '@/execution-routes'
import { redirect, type RouteObject } from 'react-router-dom'
import { ActiveRoute } from './$activeRouteId'

export const pages: RouteObject[] = [
  {
    path: '/',
    loader: async () => {
      const [route] = await getRoutes()

      if (route != null) {
        return redirect(`/${route.id}`)
      }
    },
  },
  ActiveRoute,
]
