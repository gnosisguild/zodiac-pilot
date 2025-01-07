import { z } from 'zod'
import type { Route } from './+types/edit-route'

export const loader = ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url)

  return { url }
}

const EditRoute = ({ loaderData }: Route.ComponentProps) => {
  return null
}

export default EditRoute

const chainIdSchema = z.union([
  z.literal(1),
  z.literal(10),
  z.literal(100),
  z.literal(11155111),
  z.literal(137),
  z.literal(42161),
  z.literal(43114),
  z.literal(8453),
])

const addressSchema = z.string().regex(/0x\w+/)
const prefixedAddressSchema = z
  .string()
  .regex(/eth|oeth|gno|sep|matic|arb1|avax|base:0x\w+/)

const safeSchema = z.object({
  type: z.literal('SAFE'),
  address: addressSchema,
  prefixedAddress: prefixedAddressSchema,
  chain: chainIdSchema,
  threshold: z.number(),
})

const rolesSchema = z.object({
  type: z.literal('ROLES'),
  address: addressSchema,
  prefixedAddress: prefixedAddressSchema,
  chain: chainIdSchema,
  multisend: addressSchema.array(),
  version: z.union([z.literal(1), z.literal(2)]),
})

const delaySchema = z.object({
  type: z.literal('DELAY'),
  address: addressSchema,
  prefixedAddress: prefixedAddressSchema,
  chain: chainIdSchema,
})

const ownConnectionSchema = z.object({
  type: z.literal('OWNS'),
  from: prefixedAddressSchema,
})

const isEnabledConnectionSchema = z.object({
  type: z.literal('IS_ENABLED'),
  from: prefixedAddressSchema,
})

const isMemberConnectionSchema = z.object({
  type: z.literal('IS_MEMBER'),
  roles: z.string().array(),
  defaultRole: z.string().optional(),
  from: prefixedAddressSchema,
})

const contractSchema = z.discriminatedUnion('type', [
  safeSchema,
  rolesSchema,
  delaySchema,
])

const waypointSchema = z.object({
  account: contractSchema,
  connection: z.discriminatedUnion('type', [
    ownConnectionSchema,
    isEnabledConnectionSchema,
    isMemberConnectionSchema,
  ]),
})

const eoaSchema = z.object({
  type: z.literal('EOA'),
  address: addressSchema,
  prefixedAddress: prefixedAddressSchema,
})

const startingPointSchema = z.object({
  account: z.discriminatedUnion('type', [
    eoaSchema,
    safeSchema,
    rolesSchema,
    delaySchema,
  ]),
})

const routeSchema = z.object({
  id: z.string(),
  label: z.string(),
  avatar: prefixedAddressSchema,
  initiator: prefixedAddressSchema.optional(),
  waypoints: z.tuple([startingPointSchema]).rest(waypointSchema),
})
