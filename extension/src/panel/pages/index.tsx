import { getRoutes } from '@/execution-routes'
import { redirect, type RouteObject } from 'react-router-dom'
import { loader, Root } from './Root'
import { routes } from './routes'
import { Transactions } from './transactions'

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
  {
    path: '/:activeRouteId',
    element: <Root />,
    loader,
    children: [
      {
        path: '',
        element: <Transactions />,
      },
      {
        path: 'routes',
        children: routes,
      },
    ],
  },
]
