import { type RouteObject } from 'react-router-dom'
import { ActiveRoute } from './$activeRouteId'
import { NoRoutes } from './_index'

export const pages: RouteObject[] = [NoRoutes, ActiveRoute]
