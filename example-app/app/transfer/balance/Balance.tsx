import { Address } from 'viem'
import { ER20Balance } from './ERC20Balance'
import { EthBalance } from './EthBalance'

type BalanceProps = {
  address: Address
  contract?: Address
}

export const Balance = ({ address, contract }: BalanceProps) => {
  return (
    <div className="flex items-center gap-2 text-xs leading-none text-gray-500">
      <span className="font-semibold uppercase">Balance</span>
      {contract ? (
        <ER20Balance address={address} contract={contract} />
      ) : (
        <EthBalance address={address} />
      )}
    </div>
  )
}
