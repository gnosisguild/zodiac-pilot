import { ProvideUser } from '@/auth-client'
import { authorizedLoader } from '@/auth-server'
import {
  ProvideDevelopmentContext,
  ProvideExtensionVersion,
} from '@/components'
import * as Sentry from '@sentry/react-router'
import { inject } from '@vercel/analytics'
import { computeRoute } from '@vercel/speed-insights'
import { SpeedInsights as SpeedInsightsScript } from '@vercel/speed-insights/react'
import { dbClient, getActiveFeatures } from '@zodiac/db'
import { FeatureProvider, ToastContainer } from '@zodiac/ui'
import { useEffect } from 'react'
import {
  data,
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useParams,
} from 'react-router'
import type { Route } from './+types/root'
import './app.css'

export const meta: Route.MetaFunction = () => [{ title: 'Zodiac OS' }]

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({
      request,
      context: {
        auth: { user, tenant },
      },
    }) => {
      const url = new URL(request.url)

      const isDev = process.env.NODE_ENV === 'development'

      const routeFeatures = url.searchParams.getAll('feature')

      if (tenant == null) {
        return {
          isDev,
          user: null,
          features: routeFeatures,
        }
      }

      const features = await getActiveFeatures(dbClient(), tenant.id)

      return data(
        {
          isDev,
          user,
          features: [...features.map(({ name }) => name), ...routeFeatures],
        },
        { headers: { 'Document-Policy': 'js-profiling' } },
      )
    },
  )

export default function App({
  loaderData: { isDev, user, features },
}: Route.ComponentProps) {
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
            <ProvideUser user={user}>
              <FeatureProvider features={features}>
                <Outlet />
              </FeatureProvider>
            </ProvideUser>
          </ProvideExtensionVersion>
        </ProvideDevelopmentContext>
        <ToastContainer position="top-right" />
        <SpeedInsights />
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

const SpeedInsights = () => {
  const route = useRoute()

  return (
    <SpeedInsightsScript
      route={route}
      framework="remix"
      basePath={getBasePath()}
    />
  )
}

const useRoute = (): string | null => {
  const params = useParams()
  const location = useLocation()

  return computeRoute(location.pathname, params as never)
}

function getBasePath(): string | undefined {
  // !! important !!
  // do not access env variables using import.meta.env[varname]
  // some bundles won't replace the value at build time.
  try {
    return import.meta.env.VITE_VERCEL_OBSERVABILITY_BASEPATH as
      | string
      | undefined
  } catch {
    // do nothing
  }
}
