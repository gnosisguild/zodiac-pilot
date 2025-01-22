import { redirect, type RouteObject } from 'react-router'
import { ListRoutes } from './list'
import { Routes } from './Routes'

export const routes: RouteObject = {
  path: 'routes',
  Component: Routes,
  children: [{ index: true, loader: () => redirect('list') }, ListRoutes],
}
