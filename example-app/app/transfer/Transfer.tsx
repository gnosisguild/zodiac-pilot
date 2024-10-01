import { ConnectKitButton } from 'connectkit'
import { useAccount } from 'wagmi'
import { Balance } from './Balance'

export const Transfer = () => {
  const account = useAccount()

  if (account.isDisconnected) {
    return <ConnectKitButton />
  }

  return (
    <dl>
      <dt className="font-semibold">Account</dt>
      <dd className="flex items-center gap-2">
        {account.isConnected ? account.address : 'Connecting...'}

        <span className="rounded-sm bg-gray-200 px-1 text-xs font-bold uppercase tabular-nums text-gray-500">
          {account.chain.name}
        </span>
      </dd>

      <dt className="font-semibold">Balance</dt>
      <dd>
        <Balance contract={account.address} />
      </dd>
    </dl>
  )
}
