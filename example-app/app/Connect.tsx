import { Button } from '@/components'
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
        <Button style="critical" onClick={() => disconnect()}>
          Disconnect wallet
        </Button>
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
