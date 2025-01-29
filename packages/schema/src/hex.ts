import { z } from 'zod'

export type Hex = `0x${string}`

export const isHex = (value: string): value is Hex =>
  value.startsWith('0x') && value.length > 2

export const hexSchema = z.custom<Hex>(
  (value) => typeof value === 'string' && isHex(value),
)
