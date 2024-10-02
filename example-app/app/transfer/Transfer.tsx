import { Input } from '@/components'
import { Fragment } from 'react/jsx-runtime'
import { useAccount } from 'wagmi'
import { Balance } from './Balance'

export const Transfer = () => {
  const account = useAccount()

  return (
    <form className="flex w-1/3 flex-col gap-8">
      {account.addresses.map((address) => (
        <Fragment key={address}>
          <Input disabled defaultValue={address} label="Account" />

          <div className="grid grid-cols-2 gap-8">
            <Input label="ETH">
              <Balance address={address} />
            </Input>

            <Input label="WETH">
              <Balance
                address={address}
                contract="0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
              />
            </Input>
          </div>
        </Fragment>
      ))}
    </form>
  )
}
