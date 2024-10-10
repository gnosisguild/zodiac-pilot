import { Section } from '@/components'
import { ProvideConfig } from '@/config'
import { PropsWithChildren } from 'react'
import { createPublicClient, http } from 'viem'
import { Connected } from '../Connect'
import { ClientProps } from './ClientProps'

export const PublicClient = ({
  children,
  batch,
}: PropsWithChildren<ClientProps>) => (
  <Connected>
    <Section title="Public client">
      <ProvideConfig
        scopeKey="public"
        client={({ chain }) =>
          createPublicClient({
            chain,
            transport: http(chain.rpcUrls.default.http[0], { batch }),
          })
        }
      >
        {children}
      </ProvideConfig>
    </Section>
  </Connected>
)
