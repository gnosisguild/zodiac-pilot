import { useWagmiConfig } from '@/config'
import { type Address, formatUnits } from 'viem'
import { useBalance } from 'wagmi'
import type { BalanceValue } from './BalanceValue'
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
  token?: Address
}

const useERC20Balance = ({
  address,
  token,
}: UseER20BalanceOptions): BalanceValue | [null, null] => {
  const [config, scopeKey] = useWagmiConfig()
  const { data, isFetched, error } = useBalance({
    address,
    token,
    config,
    scopeKey,
  })

  if (error || !isFetched || data == null) {
    return [null, null]
  }

  return [formatUnits(data.value, data.decimals), data.symbol] as const
}
