import { Address, formatUnits } from 'viem'
import { useBalance } from 'wagmi'
import { BalanceValue } from './BalanceValue'
import { Symbol } from './Symbol'

type ER20BalanceProps = {
  address: Address
  token?: Address
}

export const ER20Balance = ({ address, token }: ER20BalanceProps) => {
  const [balance, symbol] = useERC20Balance({ address, token })

  return (
    <>
      {balance}
      <Symbol>{symbol}</Symbol>
    </>
  )
}

type UseER20BalanceOptions = {
  address: Address
  token: Address
}

const useERC20Balance = ({
  address,
  token,
}: UseER20BalanceOptions): BalanceValue | [null, null] => {
  const { data, isFetched, error } = useBalance({ address, token })

  if (error || !isFetched) {
    return [null, null]
  }

  return [formatUnits(data.value, data.decimals), data.symbol] as const
}
