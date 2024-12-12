import { redirect, type RouteObject } from 'react-router'
import { ActiveRoute as Component, loader } from './ActiveRoute'
import { Transactions } from './transactions'

export const ActiveRoute: RouteObject = {
  path: '/:activeRouteId',
  element: <Component />,
  loader,
  children: [
    { path: '', loader: () => redirect('transactions') },
    Transactions,
  ],
}
