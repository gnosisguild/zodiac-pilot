import { PropsWithChildren } from 'react'
import { createWalletClient, http } from 'viem'
import { Section } from './components'
import { ProvideConfig } from './ConfigProvider'
import { Connected } from './Connect'

export const WalletProvider = ({ children }: PropsWithChildren) => {
  return (
    <Connected>
      <Section
        title="Wallet provider"
        description="Interact through the connected wallet which also allows to write a contract."
      >
        <ProvideConfig
          client={({ chain }) =>
            createWalletClient({ chain, transport: http() })
          }
        >
          {children}
        </ProvideConfig>
      </Section>
    </Connected>
  )
}
