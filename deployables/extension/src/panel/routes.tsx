import { SentryErrorBoundary } from '@/sentry'
import { redirect, type RouteObject } from 'react-router'
import * as ActiveAccount from './pages/$activeAccountId/ActiveAccount'
import * as ClearTransactions from './pages/$activeAccountId/clear-transactions.$newActiveAccountId/ClearTransactions'
import * as Transactions from './pages/$activeAccountId/transactions/Transactions'
import * as Root from './pages/Root'
import * as NoRoutes from './pages/_index/NoRoutes'

export const routes: RouteObject[] = [
  {
    path: '/',
    Component: Root.default,
    ErrorBoundary: SentryErrorBoundary,
    hasErrorBoundary: true,
    loader: Root.loader,
    children: [
      { index: true, Component: NoRoutes.default, loader: NoRoutes.loader },
      {
        path: ':activeAccountId',
        Component: ActiveAccount.default,
        loader: ActiveAccount.loader,
        action: ActiveAccount.action,
        children: [
          { index: true, loader: () => redirect('transactions') },
          {
            path: 'transactions',
            Component: Transactions.default,
            action: Transactions.action,
          },
          {
            path: 'clear-transactions/:newActiveAccountId',
            Component: ClearTransactions.default,
          },
        ],
      },
    ],
  },
]
