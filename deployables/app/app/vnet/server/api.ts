import { getTenderlyCredentials } from '@zodiac/env'
import type { z, ZodTypeAny } from 'zod'

type VnetApiOptions<Schema extends ZodTypeAny> = {
  schema: Schema
  searchParams?: Record<string, string | number | boolean | string[] | number[]>
}

export const api = async <Schema extends ZodTypeAny>(
  endpoint: `/${string}`,
  { schema, searchParams = {} }: VnetApiOptions<Schema>,
) => {
  const { TENDERLY_ACCESS_KEY, TENDERLY_PROJECT, TENDERLY_USER } =
    getTenderlyCredentials()

  const url = new URL(
    `https://api.tenderly.co/api/v1/account/${TENDERLY_USER}/project/${TENDERLY_PROJECT}/vnets` +
      endpoint,
  )

  Object.entries(searchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => url.searchParams.append(key, entry.toString()))
    } else {
      url.searchParams.set(key, value.toString())
    }
  })

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'X-Access-Key': TENDERLY_ACCESS_KEY,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch VNet API: ${response.status}`)
  }

  const json = await response.json()
  return schema.parse(json) as z.infer<Schema>
}
