import { getDBConnectionString } from '@zodiac/env'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/schema',
  out: './supabase/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: getDBConnectionString(),
  },
})
