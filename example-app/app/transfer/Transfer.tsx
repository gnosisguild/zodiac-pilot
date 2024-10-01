import { ConnectKitButton } from 'connectkit'
import { useAccount, useDisconnect } from 'wagmi'
import { Balance } from './Balance'

export const Transfer = () => {
  const account = useAccount()
  const { disconnect } = useDisconnect()

  if (account.isDisconnected || account.isConnecting) {
    return <ConnectKitButton />
  }

  return (
    <dl>
      <dt className="font-semibold">Account</dt>
      <dd className="flex items-center gap-2">
        {account.address}

        <span className="rounded-sm bg-gray-200 px-1 text-xs font-bold uppercase tabular-nums text-gray-500">
          {account.chain.name}
        </span>

        <button
          className="rounded bg-red-50 px-2 text-red-500 outline-none transition-colors hover:bg-red-100"
          onClick={() => disconnect()}
        >
          Disconnect
        </button>
      </dd>

      <dt className="font-semibold">Balance</dt>
      <dd>
        <Balance contract={account.address} />
      </dd>
    </dl>
  )
}
