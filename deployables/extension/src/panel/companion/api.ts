import { invariant } from '@epic-web/invariant'
import { getCompanionAppUrl } from '@zodiac/env'
import { formData } from '@zodiac/form-data'
import type { z, ZodTypeAny } from 'zod'

export type FetchOptions = {
  signal?: AbortSignal
}

type ApiOptions<Schema extends ZodTypeAny> = {
  schema: Schema
  body?: Record<string, string | number>
} & FetchOptions

export const api = async <Schema extends ZodTypeAny>(
  pathname: string,
  { schema, signal, body }: ApiOptions<Schema>,
) => {
  const url = new URL(pathname, getCompanionAppUrl())

  const response = await fetch(url, {
    signal,
    body: body == null ? undefined : formData(body),
    method: body == null ? 'GET' : 'POST',
  })

  invariant(
    response.ok,
    `Failed to fetch from companion app: ${response.status}`,
  )

  const json = await response.json()

  return schema.parse(json) as z.infer<Schema>
}
