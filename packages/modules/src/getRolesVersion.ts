import { SupportedZodiacModuleType } from './ZodiacModule'

export const getRolesVersion = (moduleType: SupportedZodiacModuleType) => {
  switch (moduleType) {
    case SupportedZodiacModuleType.ROLES_V1:
      return 1
    case SupportedZodiacModuleType.ROLES_V2:
      return 2
  }

  throw new Error(`Non versioned module type "${moduleType}"`)
}
