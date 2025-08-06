import { Hex, isHex } from '@zodiac/schema'
import { decodeBytes32String, encodeBytes32String } from 'ethers'

export const encodeRoleKey = (roleKey: string): Hex => {
  if (isHex(roleKey, { length: 66 })) {
    // already encoded
    return roleKey
  }

  return encodeBytes32String(roleKey) as Hex
}

export const decodeRoleKey = (roleKey: string): Hex => {
  if (isHex(roleKey, { length: 66 })) {
    return decodeBytes32String(roleKey) as Hex
  }

  try {
    encodeBytes32String(roleKey)
  } catch {
    throw new Error(`Invalid role key: ${roleKey}`)
  }

  return roleKey as Hex
}
