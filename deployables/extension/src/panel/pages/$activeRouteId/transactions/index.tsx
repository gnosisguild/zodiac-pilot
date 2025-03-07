import { action, Transactions as Component, loader } from './Transactions'

export const Transactions = {
  path: 'transactions',
  element: <Component />,
  action,
  loader,
}
