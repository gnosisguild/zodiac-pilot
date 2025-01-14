import { KnownContracts } from '@gnosis.pm/zodiac'

export type SupportedModuleType =
  | KnownContracts.DELAY
  | KnownContracts.ROLES_V1
  | KnownContracts.ROLES_V2

export type ZodiacModule = {
  moduleAddress: string
  mastercopyAddress?: string // if empty, it's a custom non-proxied deployment
  type: SupportedModuleType
  modules?: ZodiacModule[]
}

export const ZODIAC_MODULE_NAMES = {
  [KnownContracts.DELAY]: 'Delay',
  [KnownContracts.ROLES_V1]: 'Roles v1',
  [KnownContracts.ROLES_V2]: 'Roles v2',
}
