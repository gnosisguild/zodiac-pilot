import type { RouteObject } from 'react-router-dom'
import { Root } from './Root'
import { routes } from './routes'
import { Transactions } from './transactions'

export const pages: RouteObject[] = [
  {
    path: '/',
    element: <Root />,
    children: [
      {
        path: '/',
        element: <Transactions />,
      },
      {
        path: '/routes',
        children: routes,
      },
    ],
  },
]
