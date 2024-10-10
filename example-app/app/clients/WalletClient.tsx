import { Section } from '@/components'
import { ProvideConfig } from '@/config'
import { PropsWithChildren } from 'react'
import { createWalletClient, http } from 'viem'
import { Connected } from '../Connect'
import { ClientProps } from './ClientProps'

export const WalletClient = ({
  children,
  batch,
}: PropsWithChildren<ClientProps>) => {
  return (
    <Connected>
      <Section
        title="Wallet client"
        description="Interact through the connected wallet which also allows to write a contract."
      >
        <ProvideConfig
          scopeKey="wallet"
          client={({ chain }) =>
            createWalletClient({
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
}
