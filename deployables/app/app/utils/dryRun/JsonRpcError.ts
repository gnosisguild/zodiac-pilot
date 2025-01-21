import { z } from 'zod'

export interface JsonRpcError extends Error {
  data:
    | {
        code: number
        message?: string
        data?: string
        originalError?: Extract<JsonRpcError['data'], { code: number }>
      }
    | string
}

const jsonRpcErrorSchema = z.object({
  data: z
    .object({
      code: z.number(),
      message: z.string().optional(),
      data: z.string().optional(),
    })
    .or(z.string()),
})

export const isJsonRpcError = (error: unknown): error is JsonRpcError => {
  try {
    jsonRpcErrorSchema.parse(error)

    return true
  } catch {
    return false
  }
}
