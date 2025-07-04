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

export async function createVnet(requestBody: CreateVnetRequest) {
  const validatedData = await api('/', {
    schema: vnetResponseSchema,
    method: 'POST',
    body: requestBody,
  })

  return {
    ...validatedData,
    rpcs: validatedData.rpcs.map((rpc) => {
      // Parse network and slug from URL: https://virtual.{network}.rpc.tenderly.co/{slug}
      const url = new URL(rpc.url)
      invariant(
        url.hostname.startsWith('virtual.') &&
          url.hostname.endsWith('.rpc.tenderly.co') &&
          !url.pathname.endsWith('/'),
        'Unexpected RPC URL',
      )
      const network = url.hostname.split('.')[1]
      const slug = url.pathname.split('/').pop()

      return {
        name: rpc.name,
        network,
        slug,
      }
    }),
  }
}
