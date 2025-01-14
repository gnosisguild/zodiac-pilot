import type { HexAddress } from '@zodiac/schema'
import { getAddress } from 'ethers'

export const validateAddress = (address: string): HexAddress | null => {
  try {
    return getAddress(address).toLowerCase() as HexAddress
  } catch {
    return null
  }
}
