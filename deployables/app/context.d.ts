import { drizzle } from 'drizzle-orm/postgres-js'
import 'react-router'

declare module 'react-router' {
  interface AppLoadContext {
    db: ReturnType<typeof drizzle>
  }
}
