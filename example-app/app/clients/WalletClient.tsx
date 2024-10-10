import { Section } from '@/components'
import { PropsWithChildren } from 'react'
import { createWalletClient, http } from 'viem'
import { Connected } from '../Connect'
import { ProvideConfig } from './ConfigProvider'

export const WalletClient = ({ children }: PropsWithChildren) => {
  return (
    <Connected>
      <Section
        title="Wallet client"
        description="Interact through the connected wallet which also allows to write a contract."
      >
        <ProvideConfig
          scopeKey="wallet"
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
