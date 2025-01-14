import { KnownContracts } from '@gnosis.pm/zodiac'

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
  moduleAddress: string
  mastercopyAddress?: string // if empty, it's a custom non-proxied deployment
  type: SupportedZodiacModuleType
  modules?: ZodiacModule[]
}

export const ZODIAC_MODULE_NAMES: Record<SupportedZodiacModuleType, string> = {
  [KnownContracts.DELAY]: 'Delay',
  [KnownContracts.ROLES_V1]: 'Roles v1',
  [KnownContracts.ROLES_V2]: 'Roles v2',
}

export const isValidZodiacModuleType = (
  type: unknown,
): type is SupportedZodiacModuleType =>
  type === SupportedZodiacModuleType.DELAY ||
  type === SupportedZodiacModuleType.ROLES_V1 ||
  type === SupportedZodiacModuleType.ROLES_V2
