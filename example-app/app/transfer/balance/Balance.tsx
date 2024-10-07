import { Address } from 'viem'
import { ER20Balance } from './ERC20Balance'

type BalanceProps = {
  address: Address
  token?: Address
}

export const Balance = ({ address, token }: BalanceProps) => {
  return (
    <div className="flex items-center gap-2 text-xs leading-none text-gray-500">
      <span className="font-semibold uppercase">Balance</span>

      <ER20Balance address={address} token={token} />
    </div>
  )
}
