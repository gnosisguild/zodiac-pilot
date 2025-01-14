import { KnownContracts } from '@gnosis.pm/zodiac'

export const SUPPORTED_ZODIAC_MODULES = [
  KnownContracts.DELAY,
  KnownContracts.ROLES_V1,
  KnownContracts.ROLES_V2,
] as const

export type SupportedModuleType = (typeof SUPPORTED_ZODIAC_MODULES)[number]

export type ZodiacModule = {
  moduleAddress: string
  mastercopyAddress?: string // if empty, it's a custom non-proxied deployment
  type: SupportedModuleType
  modules?: ZodiacModule[]
}

export const ZODIAC_MODULE_NAMES: Record<SupportedModuleType, string> = {
  [KnownContracts.DELAY]: 'Delay',
  [KnownContracts.ROLES_V1]: 'Roles v1',
  [KnownContracts.ROLES_V2]: 'Roles v2',
}
