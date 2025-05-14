import {
  ProvideDevelopmentContext,
  ProvideExtensionVersion,
} from '@/components'
import * as Sentry from '@sentry/react-router'
import { inject } from '@vercel/analytics'
import { ToastContainer } from '@zodiac/ui'
import { useEffect } from 'react'
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router'
import type { Route } from './+types/root'
import './app.css'

export const meta: Route.MetaFunction = () => [{ title: 'Pilot' }]

export const loader = () => {
  return {
    isDev: process.env.NODE_ENV === 'development',
  }
}

export default function App({ loaderData: { isDev } }: Route.ComponentProps) {
  useEffect(() => {
    if (typeof document === 'undefined') {
      return
    }

    inject({ mode: isDev ? 'development' : 'production' })
  }, [isDev])

  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        {/* <Matomo /> */}
      </head>
      <body className="overflow-x-hidden bg-zinc-50 text-base text-zinc-900 dark:bg-zinc-950 dark:text-white">
        <ProvideDevelopmentContext isDev={isDev}>
          <ProvideExtensionVersion>
            <Outlet />
          </ProvideExtensionVersion>
        </ProvideDevelopmentContext>
        <ToastContainer />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Oops!'
  let details = 'An unexpected error occurred.'
  let stack: string | undefined

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error'
    details =
      error.status === 404
        ? 'The requested page could not be found.'
        : error.statusText || details
  } else if (error instanceof Error) {
    Sentry.captureException(error)

    if (import.meta.env.DEV) {
      details = error.message
      stack = error.stack
    }
  }

  return (
    <main className="container mx-auto p-4 pt-16">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full overflow-x-auto p-4">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  )
}
