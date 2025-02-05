import { lazy } from 'react'

export { AvatarInput } from './AvatarInput'
export { ChainSelect } from './ChainSelect'
export { Page } from './Page'
export * from './wallet'
export { ZodiacMod } from './ZodiacMod'

export const DebugJson = lazy(async () => {
  const { DebugJson } = await import('./DebugJson')

  return { default: DebugJson }
})
