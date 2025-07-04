import { getTenderlyCredentials } from '@zodiac/env'
import type { z, ZodTypeAny } from 'zod'

type VnetApiOptions<Schema extends ZodTypeAny> = {
  schema: Schema
  searchParams?: Record<string, string | number | boolean | string[] | number[]>
  method?: 'GET' | 'POST'
  body?: Record<string, unknown>
}

export const api = async <Schema extends ZodTypeAny>(
  endpoint: `/${string}`,
  { schema, searchParams = {}, method = 'GET', body }: VnetApiOptions<Schema>,
) => {
  const { TENDERLY_ACCESS_KEY, TENDERLY_PROJECT, TENDERLY_USER } =
    getTenderlyCredentials()

  const url = new URL(
    `https://api.tenderly.co/api/v1/account/${TENDERLY_USER}/project/${TENDERLY_PROJECT}/vnets` +
      endpoint,
  )

  const fetchOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Access-Key': TENDERLY_ACCESS_KEY,
    },
  }

  Object.entries(searchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => url.searchParams.append(key, entry.toString()))
    } else {
      url.searchParams.set(key, value.toString())
    }
  })

  if (method === 'POST' && body) {
    fetchOptions.body = JSON.stringify(body)
  }

  const response = await fetch(url, fetchOptions)

  if (!response.ok) {
    throw new Error(`Failed to fetch VNet API: ${response.status}`)
  }

  const json = await response.json()
  return schema.parse(json) as z.infer<Schema>
}
