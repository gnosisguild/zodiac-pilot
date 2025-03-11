import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router'
import type { Route } from './+types/root'
import './general.css'
import { Matomo } from './matomo'

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
      className="snap-y snap-proximity bg-white antialiased dark:bg-zinc-950"
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <Matomo />
      </head>
      <body className="relative h-full snap-y snap-proximity scroll-smooth text-zinc-900 dark:text-white">
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
