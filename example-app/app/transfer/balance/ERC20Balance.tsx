import { Address, erc20Abi, formatUnits } from 'viem'
import { useReadContract } from 'wagmi'
import { BalanceValue } from './BalanceValue'
import { Symbol } from './Symbol'

type ER20BalanceProps = {
  address: Address
  contract: Address
}

export const ER20Balance = ({ address, contract }: ER20BalanceProps) => {
  const [balance, symbol] = useERC20Balance({ address, contract })

  return (
    <>
      {balance}
      <Symbol>{symbol}</Symbol>
    </>
  )
}

type UseER20BalanceOptions = {
  address: Address
  contract: Address
}

const useERC20Balance = ({
  address,
  contract,
}: UseER20BalanceOptions): BalanceValue | [null, null] => {
  const balanceOf = useReadContract({
    abi: erc20Abi,
    functionName: 'balanceOf',
    address: contract,
    args: [address],
  })

  const decimals = useReadContract({
    abi: erc20Abi,
    functionName: 'decimals',
    address: contract,
  })

  const symbol = useReadContract({
    abi: erc20Abi,
    functionName: 'symbol',
    address: contract,
  })

  if (
    !balanceOf.isFetched ||
    balanceOf.error != null ||
    !decimals.isFetched ||
    decimals.error != null ||
    !symbol.isFetched ||
    symbol.error != null
  ) {
    return [null, null]
  }

  return [formatUnits(balanceOf.data, decimals.data), symbol.data] as const
}
