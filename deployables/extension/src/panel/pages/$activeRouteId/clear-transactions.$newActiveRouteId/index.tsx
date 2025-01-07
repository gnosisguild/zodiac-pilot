import { action, ClearTransactions as Component } from './ClearTransactions'

export const ClearTransactions = {
  path: 'clear-transactions/:newActiveRouteId',
  element: <Component />,
  action,
}
