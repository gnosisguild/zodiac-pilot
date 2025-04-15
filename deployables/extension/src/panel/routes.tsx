import { SentryErrorBoundary } from '@/sentry'
import { redirect, type RouteObject } from 'react-router'
import * as ActiveRoute from './pages/$activeRouteId/ActiveRoute'
import * as ClearTransactions from './pages/$activeRouteId/clear-transactions.$newActiveRouteId/ClearTransactions'
import * as Transactions from './pages/$activeRouteId/transactions/Transactions'
import * as Root from './pages/Root'
import * as NoRoutes from './pages/_index/NoRoutes'

export const routes: RouteObject[] = [
  {
    path: '/',
    Component: Root.default,
    ErrorBoundary: SentryErrorBoundary,
    hasErrorBoundary: true,
    loader: Root.loader,
    action: Root.action,
    children: [
      { index: true, Component: NoRoutes.default, loader: NoRoutes.loader },
      {
        path: ':activeAccountId',
        Component: ActiveRoute.default,
        loader: ActiveRoute.loader,
        children: [
          { index: true, loader: () => redirect('transactions') },
          {
            path: 'transactions',
            Component: Transactions.default,
            loader: Transactions.loader,
            action: Transactions.action,
          },
          {
            path: 'clear-transactions/:newActiveAccountId',
            Component: ClearTransactions.default,
            action: ClearTransactions.action,
          },
        ],
      },
    ],
  },
]
