import { formatBytes32String, parseBytes32String } from 'ethers/lib/utils'

export const encodeRoleKey = (key: string) => {
  if (key.length === 66 && key.startsWith('0x')) {
    const keyLower = key.toLowerCase()
    // validate bytes32 hex string
    if (!keyLower.match(/^0x[0-9a-f]{64}$/)) {
      throw new Error('Invalid hex string')
    }
    return key.toLowerCase()
  }

  return formatBytes32String(key)
}

export const decodeRoleKey = (key: string) => {
  if (key.length === 66 && key.startsWith('0x')) {
    try {
      return parseBytes32String(key)
    } catch (e) {
      return
    }
  }
}
