import { getTenderlyCredentials } from '@zodiac/env'
import type { z, ZodTypeAny } from 'zod'

type ApiOptions<Schema extends ZodTypeAny> = {
  schema: Schema
  data?: Record<string, string | number | boolean | string[] | number[]>
  body?: Record<string, unknown>
  method?: 'GET' | 'POST'
}

export const api = async <Schema extends ZodTypeAny>(
  endpoint: `/${string}`,
  { schema, data = {}, method = 'GET', body }: ApiOptions<Schema>,
) => {
  const { TENDERLY_ACCESS_KEY, TENDERLY_PROJECT, TENDERLY_USER } =
    getTenderlyCredentials()

  const url = new URL(
    `https://api.tenderly.co/api/v1/account/${TENDERLY_USER}/project/${TENDERLY_PROJECT}${endpoint}`,
  )

  const fetchOptions: RequestInit = {
    method,
    headers: {
      'X-Access-Key': TENDERLY_ACCESS_KEY,
      'Content-Type': 'application/json',
    },
  }

  Object.entries(data).forEach(([key, value]) =>
    Array.isArray(value)
      ? value.forEach((entry) => url.searchParams.append(key, entry.toString()))
      : url.searchParams.set(key, value.toString()),
  )

  if (method !== 'GET') {
    fetchOptions.body = JSON.stringify(body)
  }

  const response = await fetch(url, fetchOptions)

  const json = await response.json()
  return schema.parse(json) as z.infer<Schema>
}
