import { PropsWithChildren } from 'react'
import { Abi, Address, erc20Abi, formatEther, formatUnits } from 'viem'
import { useBalance, useReadContract } from 'wagmi'

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

const useEthBalance = (address: Address): BalanceValue | [null, null] => {
  const { data, isFetched } = useBalance({ address })

  if (isFetched) {
    return [formatEther(data.value), data.symbol] as const
  }

  return [null, null]
}

const Symbol = ({ children }: PropsWithChildren) => (
  <span className="rounded bg-blue-100 px-1 text-xs font-semibold uppercase tabular-nums text-blue-500">
    {children}
  </span>
)

type BalanceValue = [balance: string, symbol: string]

type EthBalanceProps = {
  address: Address
}

const EthBalance = ({ address }: EthBalanceProps) => {
  const [balance, symbol] = useEthBalance(address)

  return (
    <>
      {balance}

      <Symbol>{symbol}</Symbol>
    </>
  )
}

type UseER20BalanceOptions<T extends Abi> = {
  address: Address
  contract: Address
}

const useERC20Balance = <T extends Abi>({
  address,
  contract,
}: UseER20BalanceOptions<T>): BalanceValue | [null, null] => {
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

  if (balanceOf.isFetched && decimals.isFetched && symbol.isFetched) {
    return [formatUnits(balanceOf.data, decimals.data), symbol.data] as const
  }

  return [null, null]
}

type ER20BalanceProps = {
  address: Address
  contract: Address
}

const ER20Balance = ({ address, contract }: ER20BalanceProps) => {
  const [balance, symbol] = useERC20Balance({ address, contract })

  return (
    <>
      {balance}
      <Symbol>{symbol}</Symbol>
    </>
  )
}
