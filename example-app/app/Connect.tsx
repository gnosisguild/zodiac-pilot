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
          className="rounded bg-red-500 px-4 py-2 text-white outline-none transition-colors hover:bg-red-600"
          onClick={() => disconnect()}
        >
          Disconnect wallet
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
