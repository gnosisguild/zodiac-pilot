import { invariant } from '@epic-web/invariant'
import { isUUID } from '@zodiac/schema'
import { UUID } from 'crypto'
import { getOptionalUUID } from './getOptionalUUID'

export const getUUID = (data: FormData, key: string): UUID => {
  const value = getOptionalUUID(data, key)

  invariant(value != null, `value under "${key}" is not present`)

  return value
}

export const getUUIDList = (data: FormData, key: string): UUID[] => {
  const values = data.getAll(key)

  return values.reduce<UUID[]>((result, value) => {
    if (typeof value !== 'string') {
      return result
    }

    if (value.trim() === '') {
      return result
    }

    if (!isUUID(value)) {
      return result
    }

    return [...result, value]
  }, [])
}
