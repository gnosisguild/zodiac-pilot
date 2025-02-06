import { lazy } from 'react'

export { AvatarInput } from './AvatarInput'
export { ChainSelect } from './ChainSelect'
export { ProvideDevelopmentContext, useIsDev } from './DevelopmentContext'
export * from './navigation'
export { Page } from './Page'
export * from './pilotStatus'
export * from './versionManagement'
export * from './wallet'
export { ZodiacMod } from './ZodiacMod'

export const DebugJson = lazy(async () => {
  const { DebugJson } = await import('./DebugJson')

  return { default: DebugJson }
})
