import { EditRoute } from './edit-route'
import { ListRoutes } from './list-routes'
import { Transactions } from './transactions'

export const appRoutes = [
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
]
