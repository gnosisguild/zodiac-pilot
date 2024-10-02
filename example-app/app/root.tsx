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
      <body className="flex h-full w-full flex-col items-center text-sm">
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <ConnectKitProvider>
              <div className="flex h-full w-1/2 flex-1 flex-col justify-between py-12">
                <div className="flex flex-col gap-8">
                  <h1 className="text-2xl font-bold">
                    zodiac pilot{' '}
                    <span className="font-normal">example app</span>
                  </h1>

                  <Connected>
                    <Transfer />
                  </Connected>
                </div>

                <Connect />
              </div>
            </ConnectKitProvider>
          </QueryClientProvider>
        </WagmiProvider>

        <Scripts />
      </body>
    </html>
  )
}
