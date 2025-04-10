import type { DBClient } from '@zodiac/db'

declare module 'react-router' {
  export interface AppLoadContext {
    db: DBClient
  }
}
