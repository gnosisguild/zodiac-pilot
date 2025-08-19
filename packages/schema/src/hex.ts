import { z } from 'zod'

export type Hex = `0x${string}`

type IsHexOptions = {
  length?: number
}

export const isHex = (
  value: unknown,
  { length }: IsHexOptions = {},
): value is Hex => {
  if (typeof value !== 'string' || !value.startsWith('0x')) {
    return false
  }

  if (length != null) {
    return value.length === length
  }

  return value.length >= 2
}

export const hexSchema = z.custom<Hex>(
  (value) => typeof value === 'string' && isHex(value),
)
