import { SentryErrorBoundary } from '@/sentry'
import { type RouteObject } from 'react-router'
import { ActiveRoute } from './$activeRouteId'
import { NoRoutes } from './_index'
import { action, loader, Root } from './Root'

export const pages: RouteObject[] = [
  {
    path: '/',
    element: <Root />,
    ErrorBoundary: SentryErrorBoundary,
    hasErrorBoundary: true,
    loader,
    action,
    children: [NoRoutes, ActiveRoute],
  },
]
