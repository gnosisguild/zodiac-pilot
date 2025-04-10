import { getDBConnectionString } from '@zodiac/env'
import { drizzle } from 'drizzle-orm/postgres-js'
import { default as postgres } from 'postgres'
import type { Ref } from 'react'
import { schema } from './schema'

const clientRef: Ref<ReturnType<typeof postgres>> = { current: null }

export const dbClient = () => {
  if (clientRef.current == null) {
    clientRef.current = postgres(getDBConnectionString())
  }

  return drizzle({ client: clientRef.current, schema })
}

type DefaultClient = ReturnType<typeof dbClient>
type TransactionClient = Parameters<
  Parameters<DefaultClient['transaction']>[0]
>[0]

export type DBClient = DefaultClient | TransactionClient
