import type { Hex } from '@zodiac/schema'

declare module 'abitype' {
  export interface Register {
    addressType: Hex
  }
}
