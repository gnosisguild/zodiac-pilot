import { getAddress } from '@ethersproject/address'

export default function (safeAddress: string): boolean {
  try {
    const address = getAddress(safeAddress)
    return !!address
  } catch (e) {
    return false
  }
}
