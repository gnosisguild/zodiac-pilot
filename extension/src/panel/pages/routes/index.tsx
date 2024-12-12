import { redirect, type RouteObject } from 'react-router'
import { EditRoute } from './edit.$routeId'
import { ListRoutes } from './list'

export const routes: RouteObject = {
  path: 'routes',
  children: [
    { path: '', loader: () => redirect('list') },
    ListRoutes,
    EditRoute,
  ],
}
