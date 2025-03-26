import { getDBConnectionString } from '@zodiac/env'
import { drizzle } from 'drizzle-orm/postgres-js'
import { default as postgres } from 'postgres'
import { schema } from './schema'

export const dbClient = () => {
  const client = postgres(getDBConnectionString())

  return drizzle({ client, schema })
}

export type DBClient = ReturnType<typeof dbClient>
