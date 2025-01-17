import { type RouteObject } from 'react-router'
import { ActiveRoute } from './$activeRouteId'
import { NoRoutes } from './_index'
import { Root } from './Root'
import { routes } from './routes'

export const pages: RouteObject[] = [
  { Component: Root, children: [NoRoutes, ActiveRoute, routes] },
]
