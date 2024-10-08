import { invariantResponse } from '@epic-web/invariant'
import { json } from '@remix-run/node'
import { Links, Meta, Scripts, useLoaderData } from '@remix-run/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConnectKitProvider } from 'connectkit'
import { useAccount, WagmiProvider } from 'wagmi'
import { config } from './config'
import { Connect } from './Connect'
import { PublicClient } from './PublicClient'
import './tailwind.css'
import { Balance, Transfer } from './transfer'
import { WalletClient } from './WalletClient'
import { WebsocketClient } from './WebsocketClient'
import { wethContract } from './wethContract'

const getProjectId = () => {
  const { PROJECT_ID } = process.env

  invariantResponse(PROJECT_ID, '"PROJECT_ID" environment variable not found')

  return PROJECT_ID
}

export const loader = () => json({ projectId: getProjectId() })

export const queryClient = new QueryClient()

export default function App() {
  const { projectId } = useLoaderData<typeof loader>()
  const defaultConfig = config(projectId)

  return (
    <html className="h-full w-full">
      <head>
        <link rel="icon" href="data:image/x-icon;base64,AA" />
        <Meta />
        <Links />
      </head>
      <body className="flex h-full w-full flex-col items-center bg-white text-sm">
        <div className="flex h-full flex-1 flex-col gap-8 py-12 xl:w-2/3">
          <h1 className="text-2xl font-bold">
            zodiac pilot <span className="font-normal">example app</span>
          </h1>

          <div className="grid grid-cols-3 gap-8">
            <QueryClientProvider client={queryClient}>
              <WagmiProvider config={defaultConfig}>
                <ConnectKitProvider>
                  <div className="col-span-3">
                    <Connect />
                  </div>

                  <div className="col-span-2 flex flex-col gap-8">
                    <WalletClient>
                      <Transfer />
                    </WalletClient>
                  </div>

                  <div className="flex flex-col gap-8">
                    <PublicClient>
                      <Balances />
                    </PublicClient>

                    <WebsocketClient>
                      <Balances />
                    </WebsocketClient>
                  </div>
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

const Balances = () => {
  const account = useAccount()

  return (
    <>
      <Balance address={account.address} />
      <Balance address={account.address} token={wethContract} />
    </>
  )
}
