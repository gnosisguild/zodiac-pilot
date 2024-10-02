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
        <button
          className="rounded bg-red-50 px-2 text-red-500 outline-none transition-colors hover:bg-red-100"
          onClick={() => disconnect()}
        >
          Disconnect
        </button>
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
