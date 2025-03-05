import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router'
import type { Route } from './+types/root'
import './general.css'

export const meta: Route.MetaFunction = () => [
  { title: 'Zodiac Pilot' },
  {
    name: 'description',
    content: 'Zodiac Pilot — Batch and simulate transactions',
  },
]

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className="bg-linear-to-b min-h-full from-white to-zinc-50 text-base dark:from-zinc-950 dark:via-zinc-950 dark:to-gray-900"
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full text-zinc-900 dark:text-white">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}
