import { ConnectKitButton } from 'connectkit'
import { Fragment } from 'react/jsx-runtime'
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
      {account.addresses.map((address) => (
        <Fragment key={address}>
          <dt className="font-semibold">Account</dt>
          <dd className="flex items-center gap-2">
            {account.address}

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
        </Fragment>
      ))}
    </dl>
  )
}
