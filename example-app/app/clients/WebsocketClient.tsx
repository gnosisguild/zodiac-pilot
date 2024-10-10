import { Section } from '@/components'
import { ProvideConfig } from '@/config'
import { PropsWithChildren } from 'react'
import { createPublicClient, webSocket } from 'viem'
import { Connected } from '../Connect'

export const WebsocketClient = ({ children }: PropsWithChildren) => (
  <Connected>
    <Section title="Websocket client">
      <ProvideConfig
        scopeKey="websocket"
        client={({ chain }) =>
          createPublicClient({
            chain,
            transport: webSocket(chain.rpcUrls.default.webSocket?.[0]),
          })
        }
      >
        {children}
      </ProvideConfig>
    </Section>
  </Connected>
)
