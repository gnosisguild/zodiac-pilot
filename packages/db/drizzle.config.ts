import { getDBConnectionString } from '@zodiac/env'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './schema',
  out: './supabase/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: getDBConnectionString(),
  },
})
