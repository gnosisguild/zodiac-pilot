import { Fuel } from 'lucide-react'
import { formatGwei } from 'viem'
import { useGasPrice } from 'wagmi'
import { useWagmiConfig } from '../ConfigProvider'

export const Gas = () => {
  const [config, scopeKey] = useWagmiConfig()
  const { isFetched, data, error } = useGasPrice({ config, scopeKey })

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
