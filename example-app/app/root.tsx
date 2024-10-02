import { invariantResponse } from '@epic-web/invariant'
import { json } from '@remix-run/node'
import { Links, Meta, Scripts, useLoaderData } from '@remix-run/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConnectKitProvider } from 'connectkit'
import { WagmiProvider } from 'wagmi'
import { config } from './config'
import { Connect, Connected } from './Connect'
import './tailwind.css'
import { Transfer } from './transfer'

const getProjectId = () => {
  const { PROJECT_ID } = process.env

  invariantResponse(PROJECT_ID, '"PROJECT_ID" environment variable not found')

  return PROJECT_ID
}

export const loader = () => json({ projectId: getProjectId() })

export const queryClient = new QueryClient()

export default function App() {
  const { projectId } = useLoaderData<typeof loader>()
  const wagmiConfig = config(projectId)

  return (
    <html className="h-full w-full">
      <head>
        <link rel="icon" href="data:image/x-icon;base64,AA" />
        <Meta />
        <Links />
      </head>
      <body className="flex h-full w-full flex-col items-center justify-center gap-8 text-sm">
        <WagmiProvider config={wagmiConfig}>
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
