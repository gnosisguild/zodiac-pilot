import { PublicClient, WalletClient, WebsocketClient } from '@/clients'
import { Button, Checkbox, Section, Value } from '@/components'
import { getWagmiConfig, useWagmiConfig } from '@/config'
import { Balance, Transfer } from '@/transfer'
import { invariantResponse } from '@epic-web/invariant'
import { json } from '@remix-run/node'
import { Links, Meta, Scripts, useLoaderData } from '@remix-run/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConnectKitProvider } from 'connectkit'
import { useState } from 'react'
import { formatUnits } from 'viem'
import { useAccount, useBlock, WagmiProvider } from 'wagmi'
import { Connect, Connected } from './Connect'
import './tailwind.css'
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
  const defaultConfig = getWagmiConfig(projectId)
  const [batch, setBatch] = useState(true)

  return (
    <html className="h-full w-full">
      <head>
        <link rel="icon" href="data:image/x-icon;base64,AA" />
        <Meta />
        <Links />
      </head>
      <body className="flex h-full w-full flex-col items-center bg-white text-sm">
        <div className="mx-8 flex h-full flex-1 flex-col gap-8 py-12 xl:w-2/3">
          <h1 className="flex items-center justify-between text-2xl font-bold">
            <span className="bg-gradient-to-r from-purple-500 to-teal-500 bg-clip-text text-transparent">
              zodiac pilot
            </span>
            <span className="text-sm font-semibold uppercase text-gray-500">
              Test app
            </span>
          </h1>

          <div className="grid grid-cols-3 gap-8">
            <QueryClientProvider client={queryClient}>
              <WagmiProvider config={defaultConfig}>
                <ConnectKitProvider>
                  <div className="col-span-3 flex flex-col gap-6">
                    <Connect />

                    <Connected>
                      <Section>
                        <Checkbox
                          checked={batch}
                          onChange={(event) => setBatch(event.target.checked)}
                        >
                          Batch
                        </Checkbox>
                      </Section>
                    </Connected>
                  </div>

                  <div className="col-span-2 flex flex-col gap-8">
                    <WalletClient batch={batch}>
                      <Transfer />
                    </WalletClient>
                  </div>

                  <div className="flex flex-col gap-8">
                    <PublicClient batch={batch}>
                      <Balances />
                      <BlockHeight />
                    </PublicClient>

                    <WebsocketClient>
                      <Balances />
                      <BlockHeight />
                    </WebsocketClient>
                  </div>
                </ConnectKitProvider>
              </WagmiProvider>
            </QueryClientProvider>

            <Button
              onClick={() => {
                chrome.runtime.sendMessage({ type: 'open-extension-panel' })
              }}
            >
              Open extension
            </Button>
          </div>
        </div>

        <Scripts />
      </body>
    </html>
  )
}

const Balances = () => {
  const account = useAccount()

  if (account.address == null) {
    return null
  }

  return (
    <>
      <Balance address={account.address} />
      <Balance address={account.address} token={wethContract} />
    </>
  )
}

const BlockHeight = () => {
  const [config, scopeKey] = useWagmiConfig()
  const block = useBlock({ blockTag: 'latest', config, scopeKey })

  if (block.data == null) {
    return null
  }

  return (
    <>
      <Value label="Block number">{formatUnits(block.data.number, 0)}</Value>
      <Value label="Block size">{formatUnits(block.data.size, 0)}</Value>
    </>
  )
}
