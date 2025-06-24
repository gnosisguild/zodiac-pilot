import { invariant } from '@epic-web/invariant'
import { isUUID } from '@zodiac/schema'
import { getOptionalString } from './getOptionalString'

export const getOptionalUUID = (data: FormData, key: string) => {
  const value = getOptionalString(data, key)

  if (value == null) {
    return null
  }

  if (value.trim() === '') {
    return null
  }

  invariant(isUUID(value), `Value under "${key}" is not a UUID`)

  return value
}
