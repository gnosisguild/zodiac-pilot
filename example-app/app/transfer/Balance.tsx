import { formatEther } from 'viem'
import { useBalance } from 'wagmi'

type BalanceProps = {
  contract: `0x${string}`
}

export const Balance = ({ contract }: BalanceProps) => {
  const { data, isPending } = useBalance({ address: contract })

  if (isPending) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      {formatEther(data.value)}

      <span className="rounded bg-blue-100 px-1 text-xs font-semibold uppercase tabular-nums text-blue-500">
        {data.symbol}
      </span>
    </div>
  )
}
