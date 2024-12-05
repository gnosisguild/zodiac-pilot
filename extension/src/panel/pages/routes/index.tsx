import { RouteObject } from 'react-router-dom'
import { EditRoute } from './edit.$routeId'
import { ListRoutes } from './list'
import { NewRoute } from './new'

export const routes: RouteObject[] = [
  { path: '', element: <ListRoutes /> },
  { path: 'new', element: <NewRoute /> },
  { path: ':routeId', element: <EditRoute /> },
]
