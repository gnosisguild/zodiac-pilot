import { Fuel } from 'lucide-react'
import { formatGwei } from 'viem'
import { useGasPrice } from 'wagmi'

export const Gas = () => {
  const gas = useGasPrice()

  return (
    <div className="flex items-center gap-2 text-xs">
      <Fuel size={14} />
      {gas.isFetched && formatGwei(gas.data)}
    </div>
  )
}
