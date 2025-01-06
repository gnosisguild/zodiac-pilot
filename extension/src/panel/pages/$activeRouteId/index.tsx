import { redirect, type RouteObject } from 'react-router'
import { action, ActiveRoute as Component, loader } from './ActiveRoute'
import { ClearTransactions } from './clear-transactions.$newActiveRouteId'
import { Transactions } from './transactions'

export const ActiveRoute: RouteObject = {
  path: '/:activeRouteId',
  element: <Component />,
  loader,
  action,
  children: [
    { index: true, loader: () => redirect('transactions') },
    Transactions,
    ClearTransactions,
  ],
}
