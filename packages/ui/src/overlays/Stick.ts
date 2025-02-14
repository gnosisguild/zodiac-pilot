import { lazy } from 'react'

export const Stick = lazy(async () => {
  const ReactStick = await import('react-stick')

  if (ReactStick.default) {
    // @ts-expect-error weird ESM shenanigans
    if (ReactStick.default.default) {
      // @ts-expect-error weird ESM shenanigans
      return { default: ReactStick.default.default }
    }

    return { default: ReactStick.default }
  }

  return {
    // @ts-expect-error weird ESM shenanigans
    default: ReactStick.Stick,
  }
})
