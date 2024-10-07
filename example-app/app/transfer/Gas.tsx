import { Fuel } from 'lucide-react'
import { formatGwei } from 'viem'
import { useGasPrice } from 'wagmi'

export const Gas = () => {
  const { isFetched, data, error } = useGasPrice()

  if (error != null) {
    return null
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      <Fuel size={14} />
      {isFetched && formatGwei(data)}
    </div>
  )
}
