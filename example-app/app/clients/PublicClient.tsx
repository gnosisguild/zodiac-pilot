import { Section } from '@/components'
import { PropsWithChildren } from 'react'
import { createPublicClient, http } from 'viem'
import { Connected } from '../Connect'
import { ProvideConfig } from './ConfigProvider'

export const PublicClient = ({ children }: PropsWithChildren) => (
  <Connected>
    <Section title="Public client">
      <ProvideConfig
        scopeKey="public"
        client={({ chain }) => createPublicClient({ chain, transport: http() })}
      >
        {children}
      </ProvideConfig>
    </Section>
  </Connected>
)
