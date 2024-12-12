import type { RouteObject } from 'react-router-dom'
import { EditRoute } from './edit.$routeId'
import { ListRoutes } from './list'

export const routes: RouteObject[] = [
  { path: '', ...ListRoutes },
  { path: ':routeId', ...EditRoute },
]
