import { chains, type PrefixedAddress } from 'ser-kit'
import { z } from 'zod'

export const chainIdSchema = z.union([
  z.literal(chains[0].chainId),
  z.literal(chains[1].chainId),
  z.literal(chains[2].chainId),
  z.literal(chains[3].chainId),
  z.literal(chains[4].chainId),
  z.literal(chains[5].chainId),
  z.literal(chains[6].chainId),
  z.literal(chains[7].chainId),
])

export type HexAddress = `0x${string}`

export const isHexAddress = (value: string): value is HexAddress =>
  value.startsWith('0x') && value.length > 2

export const addressSchema = z.custom<HexAddress>(
  (value) => typeof value === 'string' && isHexAddress(value),
)

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

const safeSchema = z.object({
  type: z.literal('SAFE'),
  address: addressSchema,
  prefixedAddress: prefixedAddressSchema,
  chain: chainIdSchema,
  threshold: z
    .number()
    .or(z.nan())
    .nullable()
    .transform((value) => (value == null ? NaN : value)),
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

export type StartingWaypoint = z.infer<typeof startingPointSchema>

export enum ProviderType {
  WalletConnect,
  InjectedWallet,
}

const walletConnectType = z.literal(ProviderType.WalletConnect)
const injectedProviderType = z.literal(ProviderType.InjectedWallet)

export const providerTypeSchema = z.union([
  walletConnectType,
  injectedProviderType,
])

const waypointsSchema = z.tuple([startingPointSchema]).rest(waypointSchema)

export type Waypoints = z.infer<typeof waypointsSchema>

export const executionRouteSchema = z.object({
  id: z.string(),
  label: z.string(),
  providerType: providerTypeSchema.optional(),
  avatar: prefixedAddressSchema,
  initiator: prefixedAddressSchema.optional(),
  waypoints: waypointsSchema.optional(),
})

export type ExecutionRoute = z.infer<typeof executionRouteSchema>
