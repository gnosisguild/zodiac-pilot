import { invariant } from '@epic-web/invariant'
import {
  AccountType,
  chains,
  ConnectionType,
  type ChainId,
  type PrefixedAddress,
} from 'ser-kit'
import { z } from 'zod'
import { hexSchema, isHex, type Hex } from './hex'

export const chainIdSchema = z.union([
  z.literal(chains[0].chainId),
  z.literal(chains[1].chainId),
  z.literal(chains[2].chainId),
  z.literal(chains[3].chainId),
  z.literal(chains[4].chainId),
  z.literal(chains[5].chainId),
  z.literal(chains[6].chainId),
  z.literal(chains[7].chainId),
  z.literal(chains[8].chainId),
  z.literal(chains[9].chainId),
  z.literal(chains[10].chainId),
  z.literal(chains[11].chainId),
  z.literal(chains[12].chainId),
  z.literal(chains[13].chainId),
  z.literal(chains[14].chainId),
  z.literal(chains[15].chainId),
  z.literal(chains[16].chainId),
  z.literal(chains[17].chainId),
  z.literal(chains[18].chainId),
  z.literal(chains[19].chainId),
  z.literal(chains[20].chainId),
])

invariant(
  chainIdSchema.options.length === chains.length,
  'chainIdSchema is not exhaustive',
)

export type ChainId2 =
  ChainId extends z.infer<typeof chainIdSchema>
    ? z.infer<typeof chainIdSchema>
    : never

export type HexAddress = Lowercase<Hex>
export const isHexAddress = (address: unknown): address is HexAddress =>
  isHex(address)
export const addressSchema = hexSchema.transform<HexAddress>(
  (data) => data.toLowerCase() as HexAddress,
)

export const verifyHexAddress = (value?: string) => addressSchema.parse(value)

const prefixedAddressSchema = z.custom<PrefixedAddress>((value) => {
  if (typeof value !== 'string') {
    return false
  }

  const [prefix, address] = value.split(':')

  if (!isHexAddress(address)) {
    return false
  }

  if (prefix === 'eoa') {
    return true
  }

  return chains.some(({ shortName }) => prefix === shortName)
})

export const verifyPrefixedAddress = (value: string) =>
  prefixedAddressSchema.parse(value)

const safeSchema = z.object({
  type: z.literal(AccountType.SAFE),
  address: addressSchema,
  prefixedAddress: prefixedAddressSchema,
  chain: chainIdSchema,
  threshold: z
    .number()
    .or(z.nan())
    .nullable()
    .optional()
    .transform((value) => (value == null ? NaN : value))
    .pipe(z.number().or(z.nan())),
})

const rolesSchema = z.object({
  type: z.literal(AccountType.ROLES),
  address: addressSchema,
  prefixedAddress: prefixedAddressSchema,
  chain: chainIdSchema,
  multisend: addressSchema.array().default([]),
  version: z.union([z.literal(1), z.literal(2)]),
})

const delaySchema = z.object({
  type: z.literal(AccountType.DELAY),
  address: addressSchema,
  prefixedAddress: prefixedAddressSchema,
  chain: chainIdSchema,
})

const ownConnectionSchema = z.object({
  type: z.literal(ConnectionType.OWNS),
  from: prefixedAddressSchema,
})

const isEnabledConnectionSchema = z.object({
  type: z.literal(ConnectionType.IS_ENABLED),
  from: prefixedAddressSchema,
})

const isMemberConnectionSchema = z.object({
  type: z.literal(ConnectionType.IS_MEMBER),
  roles: z.string().array(),
  defaultRole: z.string().optional(),
  from: prefixedAddressSchema,
})

export const contractSchema = z.discriminatedUnion('type', [
  safeSchema,
  rolesSchema,
  delaySchema,
])

export type Contract = z.infer<typeof contractSchema>

const connectionSchema = z.discriminatedUnion('type', [
  ownConnectionSchema,
  isEnabledConnectionSchema,
  isMemberConnectionSchema,
])

export type Connection = z.infer<typeof connectionSchema>

const waypointSchema = z.object({
  account: contractSchema,
  connection: connectionSchema,
})

export type Waypoint = z.infer<typeof waypointSchema>

const eoaSchema = z.object({
  type: z.literal(AccountType.EOA),
  address: addressSchema,
  prefixedAddress: prefixedAddressSchema,
})

const accountSchema = z.discriminatedUnion('type', [
  eoaSchema,
  safeSchema,
  rolesSchema,
  delaySchema,
])

export type Account = z.infer<typeof accountSchema>

const startingPointSchema = z.object({
  account: accountSchema,
})

export type StartingWaypoint = z.infer<typeof startingPointSchema>

export const waypointsSchema = z
  .tuple([startingPointSchema])
  .rest(waypointSchema)

export type Waypoints = z.infer<typeof waypointsSchema>

export const executionRouteSchema = z.object({
  id: z.string(),
  label: z.string().nullable().optional(),
  avatar: prefixedAddressSchema,
  initiator: prefixedAddressSchema.optional(),
  waypoints: waypointsSchema.optional(),
})

export type ExecutionRoute = z.infer<typeof executionRouteSchema>
