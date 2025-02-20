import {
  ProvideDevelopmentContext,
  ProvideExtensionVersion,
} from '@/components'
import { ToastContainer } from '@zodiac/ui'
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from 'react-router'
import type { Route } from './+types/root'

export const meta: Route.MetaFunction = () => [{ title: 'Pilot' }]

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full overflow-hidden">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="flex h-full flex-col bg-zinc-50 text-base text-zinc-900 dark:bg-zinc-950 dark:text-white">
        {children}
        <ToastContainer />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export const loader = () => ({ isDev: process.env.NODE_ENV === 'development' })

export default function App() {
  const { isDev } = useLoaderData<typeof loader>()

  return (
    <ProvideDevelopmentContext isDev={isDev}>
      <ProvideExtensionVersion>
        <Outlet />
      </ProvideExtensionVersion>
    </ProvideDevelopmentContext>
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
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message
    stack = error.stack
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
