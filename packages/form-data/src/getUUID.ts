import { invariant } from '@epic-web/invariant'
import { isUUID } from '@zodiac/schema'
import { getString } from './getString'

export const getUUID = (data: FormData, key: string) => {
  const value = getString(data, key)

  invariant(isUUID(value), `Value under "${key}" is not a UUID`)

  return value
}
