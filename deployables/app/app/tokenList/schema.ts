import {
  addressSchema,
  chainIdSchema,
  prefixedAddressSchema,
} from '@zodiac/schema'
import z from 'zod'

const tokenSchema = z.object({
  chainId: z.number(),
  name: z.string(),
  symbol: z.string(),
  logoURI: z.url(),
  address: addressSchema,
})

const _refinedTokenSchema = tokenSchema.extend({
  chainId: chainIdSchema,
  address: prefixedAddressSchema,
})

export type Token = z.infer<typeof _refinedTokenSchema>

export const assetSchema = z.object({
  tokens: z.array(tokenSchema),
})
