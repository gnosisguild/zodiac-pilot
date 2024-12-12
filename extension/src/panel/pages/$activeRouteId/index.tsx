import { redirect, type RouteObject } from 'react-router-dom'
import { ActiveRoute as Component, loader } from './ActiveRoute'
import { routes } from './routes'
import { Transactions } from './transactions'

export const ActiveRoute: RouteObject = {
  path: '/:activeRouteId',
  element: <Component />,
  loader,
  children: [
    { path: '', loader: () => redirect('transactions') },
    Transactions,
    routes,
  ],
}
