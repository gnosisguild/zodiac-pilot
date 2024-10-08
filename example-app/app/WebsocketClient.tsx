import { PropsWithChildren } from 'react'
import { createPublicClient, webSocket } from 'viem'
import { Section } from './components'
import { ProvideConfig } from './ConfigProvider'
import { Connected } from './Connect'

export const WebsocketClient = ({ children }: PropsWithChildren) => (
  <Connected>
    <Section title="Websocket client">
      <ProvideConfig
        client={({ chain }) =>
          createPublicClient({ chain, transport: webSocket() })
        }
      >
        {children}
      </ProvideConfig>
    </Section>
  </Connected>
)
