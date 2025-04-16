import type { UUID } from 'node:crypto'
import { z } from 'zod'

const uuidSchema = z.string().uuid()

export const isUUID = (value: string): value is UUID => {
  try {
    uuidSchema.parse(value)

    return true
  } catch {
    return false
  }
}
