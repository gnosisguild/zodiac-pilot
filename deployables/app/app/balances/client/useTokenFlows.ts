import { useMemo } from 'react'
import type { TokenTransfer } from '../types'

export const useTokenFlows = (flows: TokenTransfer[], address: string) => {
  return useMemo(() => {
    const addrLower = address.toLowerCase()
    return {
      sent: flows.filter((f) => f.from.toLowerCase() === addrLower),
      received: flows.filter((f) => f.to.toLowerCase() === addrLower),
      other: flows.filter(
        (f) =>
          f.from.toLowerCase() !== addrLower &&
          f.to.toLowerCase() !== addrLower,
      ),
    }
  }, [flows, address])
}
