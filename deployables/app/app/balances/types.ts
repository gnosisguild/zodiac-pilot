import type { Address } from 'ser-kit'
import { z } from 'zod'

export const tokenSchema = z.object({
  id: z.string(),
  chain: z.string(),
  name: z.string().nullable(),
  symbol: z.string().nullable(),
  display_symbol: z.string().nullable(),
  optimized_symbol: z.string().nullable(),
  decimals: z.number().int().nullable(),
  logo_url: z.string().nullable(),
  is_core: z.boolean().nullable(),
  price: z.number().nullable(),
  time_at: z.number().int().nullable(),
})

export const tokensSchema = tokenSchema.array()

const tokenBalanceSchema = tokenSchema.extend({
  amount: z.number(),
  raw_amount: z.coerce.bigint(),
})

export const tokenBalancesSchema = tokenBalanceSchema.array()

type TokenDiff = {
  amount: `${number}`
  usdValue: number
}

export type TokenBalance = {
  contractId: string
  name: string | null
  symbol: string | null
  logoUrl: string | null
  amount: `${number}`
  decimals: number
  usdValue: number | null
  usdPrice: number | null
  chain: string
  diff?: TokenDiff
}

export type TokenTransfer = TokenBalance & {
  from: Address
  to: Address
}

const chainSchema = z.object({
  id: z.string(),
  community_id: z.number().int(),
  name: z.string(),
  logo_url: z.string().nullable(),
  native_token_id: z.string(),
  wrapped_token_id: z.string(),
  is_support_pre_exec: z.boolean(),
})

export type Chain = z.infer<typeof chainSchema>
export const chainListSchema = chainSchema.array()
