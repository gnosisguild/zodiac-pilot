import { json, Links, Meta, Scripts, useLoaderData } from '@remix-run/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConnectKitProvider } from 'connectkit'
import { WagmiProvider } from 'wagmi'
import { config } from './config'
import { Connect, Connected } from './Connect'
import './tailwind.css'
import { Transfer } from './transfer'

export const loader = () => json({ projectId: process.env.PROJECT_ID })

export const queryClient = new QueryClient()

export default function App() {
  const { projectId } = useLoaderData<typeof loader>()

  return (
    <html className="h-full w-full">
      <head>
        <link rel="icon" href="data:image/x-icon;base64,AA" />
        <Meta />
        <Links />
      </head>
      <body className="flex h-full w-full flex-col items-center justify-center gap-8 text-sm">
        <WagmiProvider config={config(projectId)}>
          <QueryClientProvider client={queryClient}>
            <ConnectKitProvider>
              <h1 className="text-2xl font-bold">
                zodiac pilot <span className="font-normal">example app</span>
              </h1>

              <Connect />

              <Connected>
                <Transfer />
              </Connected>
            </ConnectKitProvider>
          </QueryClientProvider>
        </WagmiProvider>

        <Scripts />
      </body>
    </html>
  )
}
