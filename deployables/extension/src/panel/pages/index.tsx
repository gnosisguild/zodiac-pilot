import { SentryErrorBoundary } from '@/sentry'
import { type RouteObject } from 'react-router'
import { ActiveRoute } from './$activeRouteId'
import { NoRoutes } from './_index'
import { loader, Root } from './Root'
import { routes } from './routes'

export const pages: RouteObject[] = [
  {
    Component: Root,
    ErrorBoundary: SentryErrorBoundary,
    hasErrorBoundary: true,
    loader,
    children: [NoRoutes, ActiveRoute, routes],
  },
]
