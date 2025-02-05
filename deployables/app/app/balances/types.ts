import { z } from 'zod'

const tokenSchema = z.object({
  id: z.string(),
  chain: z.string(),
  name: z.string().nullable(),
  symbol: z.string().nullable(),
  display_symbol: z.string().nullable(),
  optimized_symbol: z.string().nullable(),
  decimals: z.number().int().nullable(),
  logo_url: z.string().nullable(),
  is_core: z.boolean(),
  price: z.number(),
  time_at: z.number().int().nullable(),
  amount: z.number(),
  raw_amount: z.number().int(),
})

export const tokenListSchema = tokenSchema.array()

export type ApiToken = z.infer<typeof tokenSchema>

export type TokenBalance = {
  contractId: string
  name: string | null
  symbol: string | null
  logoUrl: string | null
  amount: string
  decimals: number
  usdValue: number
  usdPrice: number
}
