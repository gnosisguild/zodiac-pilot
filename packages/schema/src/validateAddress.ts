import { getAddress } from 'viem/utils'
import type { HexAddress } from './routeSchema'

export const validateAddress = (address: string): HexAddress | null => {
  try {
    return getAddress(address) as HexAddress
  } catch {
    return null
  }
}
