import { RouteObject } from 'react-router-dom'
import { EditRoute } from './edit-route'
import { ListRoutes } from './list-routes'
import { Root } from './Root'
import { Transactions } from './transactions'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Root />,
    children: [
      {
        path: '/',
        element: <Transactions />,
      },
      {
        path: '/routes',
        element: <ListRoutes />,
      },
      {
        path: '/routes/:routeId',
        element: <EditRoute />,
      },
    ],
  },
]
