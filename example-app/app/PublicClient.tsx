import { PropsWithChildren } from 'react'
import { createPublicClient, http } from 'viem'
import { useAccount } from 'wagmi'
import { Section } from './components'
import { ProvideConfig } from './ConfigProvider'
import { Connected } from './Connect'

export const PublicClient = ({ children }: PropsWithChildren) => {
  const account = useAccount()

  return (
    <Connected>
      <Section title="Public Client">
        <ProvideConfig
          client={({ chain }) =>
            createPublicClient({ chain, transport: http() })
          }
        >
          {children}
        </ProvideConfig>
      </Section>
    </Connected>
  )
}
