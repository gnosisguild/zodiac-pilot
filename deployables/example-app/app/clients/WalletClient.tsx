import { Section } from '@/components'
import { ProvideConfig } from '@/config'
import type { PropsWithChildren } from 'react'
import { createWalletClient, http } from 'viem'
import { Connected } from '../Connect'
import type { ClientProps } from './ClientProps'

export const WalletClient = ({
  children,
  batch,
}: PropsWithChildren<ClientProps>) => {
  return (
    <Connected>
      <ProvideConfig
        scopeKey="wallet"
        client={({ chain }) =>
          createWalletClient({
            chain,
            transport: http(chain.rpcUrls.default.http[0], { batch }),
          })
        }
      >
        <Section
          title="Wallet client"
          description="Interact through the connected wallet which also allows to write a contract."
        >
          {children}
        </Section>
      </ProvideConfig>
    </Connected>
  )
}
