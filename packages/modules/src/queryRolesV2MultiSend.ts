import type { ChainId } from '@zodiac/chains'
import type { HexAddress } from '@zodiac/schema'
import { z } from 'zod'
import {
  type ChainId as RolesV2ChainId,
  chains as rolesV2Chains,
} from 'zodiac-roles-deployments'

const MULTISEND_SELECTOR = '0x8d80ff0a' // multiSend(bytes)
const ROLES_MULTISEND_UNWRAPPER = '0x93b7fcbc63ed8a3a24b59e1c3e6649d50b7427c0'

export const MULTISEND = [
  '0x38869bf66a61cf6bdb996a6ae40d5853fd43b526',
  '0xa238cbeb142c10ef7ad8442c6d1f9e89e07e7761',
  '0x998739bfdaadde7c933b942a68053933098f9eda',
  '0x0dfcccb95225ffb03c6fbb2559b530c2b7c8a912',
  '0x8d29be29923b68abfdd21e541b9374737b49cdad',
]

export const MULTISEND_CALL_ONLY = [
  '0x9641d764fc13c8b624c04430c7356c1c7c8102e2',
  '0x40a2accbd92bca938b02010e17a5b8929b49130d',
  '0xa1dabef33b3b82c7814b6d82a79e50f4ac44102b',
  '0xf220d3b4dfb23c4ade8c88e526c1353abacbc38f',
]

const multisendAdaptersSchema = z.object({
  error: z.string().optional(),
  errors: z.string().array().optional(),
  data: z
    .object({
      unwrapAdapters: z
        .object({
          targetAddress: z.string(),
        })
        .array(),
    })
    .optional(),
})

export async function queryRolesV2MultiSend(
  chainId: ChainId,
  modAddress: string,
) {
  if (!(chainId in rolesV2Chains)) {
    return []
  }

  const { subgraph } = rolesV2Chains[chainId as RolesV2ChainId]

  const res = await fetch(subgraph, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `query MultiSendAdapters($rolesMod: String!) {
        unwrapAdapters(where: { rolesModifier: $rolesMod, selector: "${MULTISEND_SELECTOR}", adapterAddress: "${ROLES_MULTISEND_UNWRAPPER}" }) {
          targetAddress
        }
      }`,
      variables: { rolesMod: modAddress.toLowerCase() },
      operationName: 'MultiSendAdapters',
    }),
  })
  const { data, error, errors } = multisendAdaptersSchema.parse(
    await res.json(),
  )

  if (error || (errors && errors[0])) {
    throw new Error(error || (errors && errors[0]))
  }

  if (!data || !data.unwrapAdapters) {
    return []
  }

  const addresses = data.unwrapAdapters.map((a: any) =>
    a.targetAddress.toLowerCase(),
  ) as `0x${string}`[]

  const multisend = addresses.find((a) => MULTISEND.includes(a))
  const multisendCallOnly = addresses.find((a) =>
    MULTISEND_CALL_ONLY.includes(a),
  )

  return [multisend, multisendCallOnly].filter(Boolean) as HexAddress[]
}
