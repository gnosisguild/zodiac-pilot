import { getAddress } from 'ethers'

export const validateAddress = (address: string) => {
  try {
    return getAddress(address).toLowerCase()
  } catch {
    return ''
  }
}
