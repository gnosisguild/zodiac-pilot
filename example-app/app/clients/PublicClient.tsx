import { Section } from '@/components'
import { ProvideConfig } from '@/config'
import { PropsWithChildren } from 'react'
import { createPublicClient, http } from 'viem'
import { Connected } from '../Connect'

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
