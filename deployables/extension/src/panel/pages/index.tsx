import { SentryErrorBoundary } from '@/sentry'
import { Outlet, type RouteObject } from 'react-router'
import { ActiveRoute } from './$activeRouteId'
import { NoRoutes } from './_index'
import { loader, Root } from './Root'
import { routes } from './routes'

export const pages: RouteObject[] = [
  {
    Component: Outlet,
    ErrorBoundary: SentryErrorBoundary,
    children: [
      { Component: Root, loader, children: [NoRoutes, ActiveRoute, routes] },
    ],
  },
]
