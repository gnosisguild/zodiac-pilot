import { Input } from '@/components'
import { Fragment } from 'react/jsx-runtime'
import { useAccount } from 'wagmi'
import { Balance } from './Balance'

export const Transfer = () => {
  const account = useAccount()

  return (
    <form className="w-1/3">
      {account.addresses.map((address) => (
        <Fragment key={address}>
          <Input defaultValue={account.address} label="Account" />

          <dt className="font-semibold">Balance</dt>
          <dd>
            <Balance contract={account.address} />
          </dd>
        </Fragment>
      ))}
    </form>
  )
}
