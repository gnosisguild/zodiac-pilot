import type { RouteObject } from 'react-router'
import { action, NoRoutes as Component, loader } from './NoRoutes'

export const NoRoutes: RouteObject = {
  path: '/',
  element: <Component />,
  loader,
  action,
}
