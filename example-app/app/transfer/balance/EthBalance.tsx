import { Address, formatEther } from 'viem'
import { useBalance } from 'wagmi'
import type { BalanceValue } from './BalanceValue'
import { Symbol } from './Symbol'

type EthBalanceProps = {
  address: Address
}

export const EthBalance = ({ address }: EthBalanceProps) => {
  const [balance, symbol] = useEthBalance(address)

  return (
    <>
      {balance}

      <Symbol>{symbol}</Symbol>
    </>
  )
}

const useEthBalance = (address: Address): BalanceValue | [null, null] => {
  const { data, isFetched, error } = useBalance({ address })

  if (error || !isFetched) {
    return [null, null]
  }

  return [formatEther(data.value), data.symbol] as const
}
