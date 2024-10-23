import { decodeBytes32String, encodeBytes32String } from 'ethers'

export const encodeRoleKey = (key: string) => {
  if (key.length === 66 && key.startsWith('0x')) {
    const keyLower = key.toLowerCase()
    // validate bytes32 hex string
    if (!keyLower.match(/^0x[0-9a-f]{64}$/)) {
      throw new Error('Invalid hex string')
    }
    return key.toLowerCase()
  }

  return encodeBytes32String(key)
}

export const decodeRoleKey = (key: string) => {
  if (key.length === 66 && key.startsWith('0x')) {
    try {
      return decodeBytes32String(key)
    } catch (e) {
      return
    }
  }
}
