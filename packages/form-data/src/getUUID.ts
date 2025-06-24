import { invariant } from '@epic-web/invariant'
import { getOptionalUUID } from './getOptionalUUID'

export const getUUID = (data: FormData, key: string) => {
  const value = getOptionalUUID(data, key)

  invariant(value != null, `value under "${key}" is not present`)

  return value
}
