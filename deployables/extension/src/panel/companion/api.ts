import { invariant } from '@epic-web/invariant'
import { getCompanionAppUrl } from '@zodiac/env'
import type { z, ZodTypeAny } from 'zod'

export type FetchOptions = {
  signal?: AbortSignal
}

type ApiOptions<Schema extends ZodTypeAny> = {
  schema: Schema
} & FetchOptions

export const api = async <Schema extends ZodTypeAny>(
  pathname: string,
  { schema, signal }: ApiOptions<Schema>,
) => {
  const url = new URL(pathname, getCompanionAppUrl())

  const response = await fetch(url, { signal })

  invariant(
    response.ok,
    `Failed to fetch from companion app: ${response.status}`,
  )

  const json = await response.json()

  return schema.parse(json) as z.infer<Schema>
}
