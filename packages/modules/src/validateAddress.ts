import { getAddress } from 'viem/utils'

export const validateAddress = (address: string) => {
  try {
    return getAddress(address)
  } catch {
    return ''
  }
}
