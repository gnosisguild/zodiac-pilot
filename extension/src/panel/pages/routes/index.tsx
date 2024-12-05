import { RouteObject } from 'react-router-dom'
import { EditRoute } from './edit.$routeId'
import { ListRoutes } from './list'

export const routes: RouteObject[] = [
  { path: '', element: <ListRoutes /> },
  { path: ':routeId', element: <EditRoute /> },
]
