import { type RouteObject } from 'react-router'
import { ActiveRoute } from './$activeRouteId'
import { NoRoutes } from './_index'
import { routes } from './routes'

export const pages: RouteObject[] = [NoRoutes, ActiveRoute, routes]
