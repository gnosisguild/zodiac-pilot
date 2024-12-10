import type { HexAddress } from '@/types'

export const randomHex = (size: number): HexAddress => {
  const hex = [...Array(size)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join('')

  return `0x${hex}`
}
