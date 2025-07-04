import { invariant } from '@epic-web/invariant'
import { hexSchema } from '@zodiac/schema'
import { z } from 'zod'
import { api } from './api'

// Schema for vnet creation response
const vnetResponseSchema = z.object({
  id: z.string(),
  slug: z.string(),
  display_name: z.string(),
  fork_config: z.object({
    network_id: z.number(),
    block_number: hexSchema,
  }),
  rpcs: z.array(
    z.object({
      name: z.string(),
      url: z.string(),
    }),
  ),
})

export type CreateVnetRequest = Record<string, unknown>

export type CreateVnetResponse = z.infer<typeof vnetResponseSchema>

export async function createVnet(requestBody: CreateVnetRequest) {
  const validatedData = await api('/', {
    schema: vnetResponseSchema,
    method: 'POST',
    body: requestBody,
  })

  return {
    ...validatedData,
    rpcs: validatedData.rpcs.map((rpc) => {
      invariant(
        rpc.url.includes('//virtual.') &&
          rpc.url.includes('.rpc.tenderly.co/') &&
          !rpc.url.endsWith('/'),
        'Unexpected RPC URL',
      )

      // Parse network and slug from URL: https://virtual.{network}.rpc.tenderly.co/{slug}
      const urlParts = rpc.url.split('/')
      const domainParts = urlParts[2].split('.') // virtual.{network}.rpc.tenderly.co
      const network = domainParts[1] // Extract network from domain
      const slug = urlParts[urlParts.length - 1] // Get the last part as slug

      return {
        name: rpc.name,
        network,
        slug,
      }
    }),
  }
}
