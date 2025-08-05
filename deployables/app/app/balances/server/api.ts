import { getDeBankApiKey } from '@zodiac/env'
import type { z, ZodTypeAny } from 'zod'

type ApiOptions<Schema extends ZodTypeAny> = {
  schema: Schema
  data?: Record<string, string | number | boolean | string[] | number[]>
}

export const api = async <Schema extends ZodTypeAny>(
  endpoint: `/${string}`,
  { schema, data = {} }: ApiOptions<Schema>,
) => {
  const url = new URL(`/v1${endpoint}`, 'https://pro-openapi.debank.com')

  Object.entries(data).forEach(([key, value]) =>
    Array.isArray(value)
      ? value.forEach((entry) => url.searchParams.append(key, entry.toString()))
      : url.searchParams.set(key, value.toString()),
  )

  const response = await fetch(url, {
    headers: { AccessKey: getDeBankApiKey() },
  })

  const json = await response.json()

  return schema.parse(json) as z.infer<Schema>
}
