import { Button, Input, Section } from '@/components'
import { ConnectKitButton } from 'connectkit'
import { PropsWithChildren } from 'react'
import { ClientOnly } from 'remix-utils/client-only'
import { useAccount, useDisconnect } from 'wagmi'

export const Connect = () => {
  const account = useAccount()
  const { disconnect } = useDisconnect()

  if (account.isDisconnected || account.isConnecting) {
    return <ConnectKitButton />
  }

  return (
    <ClientOnly>
      {() => (
        <Section>
          <div className="grid grid-cols-4 items-end gap-4">
            <Input
              disabled
              label="Wallet"
              defaultValue={account.connector.name}
            />

            <Input disabled label="Chain" defaultValue={account.chain.name} />

            <Input disabled defaultValue={account.address} label="Account" />

            <Button style="critical" onClick={() => disconnect()}>
              Disconnect wallet
            </Button>
          </div>
        </Section>
      )}
    </ClientOnly>
  )
}

export const Connected = ({ children }: PropsWithChildren) => {
  const account = useAccount()

  if (account.isDisconnected || account.isConnecting) {
    return null
  }

  return <ClientOnly>{() => children}</ClientOnly>
}
