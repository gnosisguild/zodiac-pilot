import { useWagmiConfig } from '@/config'
import { Fuel } from 'lucide-react'
import { formatGwei } from 'viem'
import { useGasPrice } from 'wagmi'

export const Gas = () => {
  const [config, scopeKey] = useWagmiConfig()
  const { data, error } = useGasPrice({ config, scopeKey })

  if (error != null) {
    return null
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      <Fuel size={14} />
      {typeof data === 'undefined' ? 'Unknown' : formatGwei(data)}
    </div>
  )
}
