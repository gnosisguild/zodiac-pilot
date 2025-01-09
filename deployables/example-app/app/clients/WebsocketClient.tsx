import { Section } from '@/components'
import { ProvideConfig } from '@/config'
import type { PropsWithChildren } from 'react'
import { createPublicClient, webSocket } from 'viem'
import { Connected } from '../Connect'

export const WebsocketClient = ({ children }: PropsWithChildren) => (
  <Connected>
    <ProvideConfig
      scopeKey="websocket"
      client={({ chain }) =>
        createPublicClient({
          chain,
          transport: webSocket(chain.rpcUrls.default.webSocket?.[0]),
        })
      }
    >
      <Section title="Websocket client">{children}</Section>
    </ProvideConfig>
  </Connected>
)
