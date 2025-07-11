import { SentryErrorBoundary } from '@/sentry'
import { type RouteObject } from 'react-router'
import * as ActiveAccount from './pages/$activeAccountId/ActiveAccount'
import * as ActiveRoute from './pages/$activeAccountId/ActiveRoute'
import * as LoadDefaultRoute from './pages/$activeAccountId/LoadDefaultRoute'
import * as NoActiveRoute from './pages/$activeAccountId/NoActiveRoute'
import * as ClearTransactions from './pages/$activeAccountId/clear-transactions.$newActiveAccountId/ClearTransactions'
import * as Transactions from './pages/$activeAccountId/transactions/Transactions'
import * as TransactionsLayout from './pages/$activeAccountId/transactions/TransactionsLayout'
import * as LoadDefaultAccount from './pages/LoadDefaultAccount'
import * as Root from './pages/Root'
import * as NoAccounts from './pages/_index/NoAccounts'

export const routes: RouteObject[] = [
  {
    path: '/',
    Component: Root.default,
    ErrorBoundary: SentryErrorBoundary,
    hasErrorBoundary: true,
    loader: Root.loader,
    children: [
      { index: true, loader: LoadDefaultAccount.loader },
      {
        path: 'no-accounts',
        Component: NoAccounts.default,
      },
      {
        path: ':activeAccountId',
        Component: ActiveAccount.default,
        loader: ActiveAccount.loader,
        action: ActiveAccount.action,
        children: [
          { index: true, loader: LoadDefaultRoute.loader },
          {
            path: 'clear-transactions/:newActiveAccountId',
            Component: ClearTransactions.default,
          },
          {
            path: 'no-routes',
            Component: NoActiveRoute.default,
            children: [
              {
                Component: TransactionsLayout.default,
                action: TransactionsLayout.action,
                children: [
                  {
                    index: true,
                    Component: Transactions.default,
                  },
                ],
              },
            ],
          },
          {
            path: ':routeId',
            Component: ActiveRoute.default,
            loader: ActiveRoute.loader,
            children: [
              {
                Component: TransactionsLayout.default,
                action: TransactionsLayout.action,
                children: [
                  {
                    index: true,
                    Component: Transactions.default,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]
