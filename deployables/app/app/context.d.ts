import type { DBClient } from '@/db'

declare module 'react-router' {
  export interface AppLoadContext {
    db: DBClient
  }
}
