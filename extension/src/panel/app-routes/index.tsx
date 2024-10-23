import { EditConnection } from './edit-route'
import { RoutesList } from './list-routes'
import { Transactions } from './transactions'

export const appRoutes = [
  {
    path: '/',
    element: <Transactions />,
  },
  {
    path: '/routes',
    element: <RoutesList />,
  },
  {
    path: '/routes/:routeId',
    element: <EditConnection />,
  },
]
