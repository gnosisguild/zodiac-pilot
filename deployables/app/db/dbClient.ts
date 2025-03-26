import { getDBConnectionString } from '@zodiac/env'
import { drizzle } from 'drizzle-orm/postgres-js'
import { default as postgres } from 'postgres'

export const dbClient = () => {
  const client = postgres(getDBConnectionString())

  return drizzle({ client })
}
