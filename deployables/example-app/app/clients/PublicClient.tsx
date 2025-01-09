import { Section } from '@/components'
import { ProvideConfig } from '@/config'
import type { PropsWithChildren } from 'react'
import { createPublicClient, http } from 'viem'
import { Connected } from '../Connect'
import type { ClientProps } from './ClientProps'

export const PublicClient = ({
  children,
  batch,
}: PropsWithChildren<ClientProps>) => (
  <Connected>
    <ProvideConfig
      scopeKey="public"
      client={({ chain }) =>
        createPublicClient({
          chain,
          transport: http(chain.rpcUrls.default.http[0], { batch }),
        })
      }
    >
      <Section title="Public client">{children}</Section>
    </ProvideConfig>
  </Connected>
)
