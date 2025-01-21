import { z } from 'zod'

export interface JsonRpcError extends Error {
  data: {
    code: number
    message?: string
    data?: string
    originalError?: JsonRpcError['data']
  }
}

const jsonRpcErrorSchema = z.object({
  data: z.object({
    code: z.number(),
    message: z.string().optional(),
    data: z.string().optional(),
  }),
})

export const isJsonRpcError = (error: unknown): error is JsonRpcError => {
  try {
    jsonRpcErrorSchema.parse(error)

    return true
  } catch {
    return false
  }
}
