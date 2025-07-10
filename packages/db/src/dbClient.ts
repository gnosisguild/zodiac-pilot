import { schema } from '@zodiac/db/schema'
import { getDBConnectionString } from '@zodiac/env'
import { drizzle } from 'drizzle-orm/postgres-js'
import { default as postgres } from 'postgres'
import type { Ref } from 'react'

const clientRef: Ref<ReturnType<typeof postgres>> = { current: null }

export const dbClient = () => {
  if (clientRef.current == null) {
    clientRef.current = postgres(getDBConnectionString(), { prepare: false })
  }

  return drizzle({ client: clientRef.current, schema })
}

export const closeCurrentClient = async () => {
  if (clientRef.current == null) {
    return
  }

  await clientRef.current.end()

  clientRef.current = null
}

type DefaultClient = ReturnType<typeof dbClient>
type TransactionClient = Parameters<
  Parameters<DefaultClient['transaction']>[0]
>[0]

export type DBClient = DefaultClient | TransactionClient
