import { SentryErrorBoundary } from '@/sentry'
import { type RouteObject } from 'react-router'
import { ActiveRoute } from './$activeRouteId'
import { NoRoutes } from './_index'
import { loader, Root } from './Root'

export const pages: RouteObject[] = [
  {
    Component: Root,
    ErrorBoundary: SentryErrorBoundary,
    hasErrorBoundary: true,
    loader,
    children: [NoRoutes, ActiveRoute],
  },
]
