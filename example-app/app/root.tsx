import { invariantResponse } from '@epic-web/invariant'
import { json } from '@remix-run/node'
import { Links, Meta, Scripts, useLoaderData } from '@remix-run/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConnectKitProvider } from 'connectkit'
import { WagmiProvider } from 'wagmi'
import { config } from './config'
import { Connect, Connected } from './Connect'
import { PublicClient } from './PublicClient'
import './tailwind.css'
import { WalletProvider } from './WalletProvider'

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
      <body className="flex h-full w-full flex-col items-center bg-white text-sm">
        <div className="flex h-full flex-1 flex-col gap-8 py-12 xl:w-1/2">
          <h1 className="text-2xl font-bold">
            zodiac pilot <span className="font-normal">example app</span>
          </h1>

          <div className="grid grid-cols-3 gap-8">
            <QueryClientProvider client={queryClient}>
              <WagmiProvider config={wagmiConfig}>
                <ConnectKitProvider>
                  <div className="col-span-3">
                    <Connect />
                  </div>

                  <div className="col-span-2 flex flex-col gap-8">
                    <Connected>
                      <WalletProvider />
                    </Connected>
                  </div>

                  <PublicClient />
                </ConnectKitProvider>
              </WagmiProvider>
            </QueryClientProvider>
          </div>
        </div>

        <Scripts />
      </body>
    </html>
  )
}
