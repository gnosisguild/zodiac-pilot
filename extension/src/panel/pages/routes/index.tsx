import { redirect, type RouteObject } from 'react-router'
import { EditRoute } from './edit.$routeId'
import { ListRoutes } from './list'
import { loader, Routes } from './Routes'

export const routes: RouteObject = {
  path: 'routes',
  element: <Routes />,
  loader,
  children: [
    { path: '', loader: () => redirect('list') },
    ListRoutes,
    EditRoute,
  ],
}
