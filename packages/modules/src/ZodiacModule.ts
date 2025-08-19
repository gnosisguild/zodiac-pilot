import { KnownContracts } from '@gnosis-guild/zodiac'
import { addressSchema, type Contract, type HexAddress } from '@zodiac/schema'
import { AccountType } from 'ser-kit'
import { z } from 'zod'

export const SUPPORTED_ZODIAC_MODULES = [
  KnownContracts.DELAY,
  KnownContracts.ROLES_V1,
  KnownContracts.ROLES_V2,
] as const

export enum SupportedZodiacModuleType {
  DELAY = KnownContracts.DELAY,
  ROLES_V1 = KnownContracts.ROLES_V1,
  ROLES_V2 = KnownContracts.ROLES_V2,
}

export type ZodiacModule = {
  moduleAddress: HexAddress
  mastercopyAddress?: string // if empty, it's a custom non-proxied deployment
  type: SupportedZodiacModuleType
  modules?: ZodiacModule[]
}

export const zodiacModuleSchema = z.object({
  moduleAddress: addressSchema,
  mastercopyAddress: addressSchema.optional(),
  type: z.union([
    z.literal(SupportedZodiacModuleType.DELAY),
    z.literal(SupportedZodiacModuleType.ROLES_V1),
    z.literal(SupportedZodiacModuleType.ROLES_V2),
  ]),
})

export const ZODIAC_MODULE_NAMES: Record<SupportedZodiacModuleType, string> = {
  [KnownContracts.DELAY]: 'Delay',
  [KnownContracts.ROLES_V1]: 'Roles v1',
  [KnownContracts.ROLES_V2]: 'Roles v2',
}

export const getModuleName = (account: Contract) => {
  switch (account.type) {
    case AccountType.DELAY: {
      return 'Delay'
    }
    case AccountType.ROLES: {
      return `Roles v${account.version}`
    }
  }
}

export const isValidZodiacModuleType = (
  type: unknown,
): type is SupportedZodiacModuleType =>
  type === SupportedZodiacModuleType.DELAY ||
  type === SupportedZodiacModuleType.ROLES_V1 ||
  type === SupportedZodiacModuleType.ROLES_V2
