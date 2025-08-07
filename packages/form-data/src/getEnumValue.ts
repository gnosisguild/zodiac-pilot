import { invariant } from '@epic-web/invariant'
import { getOptionalString } from './getOptionalString'

export const getOptionalEnumValue = <V, T extends Record<string, V>>(
  base: T,
  data: FormData,
  key: string,
): V | null => {
  const rawValue = getOptionalString(data, key)

  if (rawValue == null || rawValue.trim() === '') {
    return null
  }

  const values = Object.values(base)

  const value = values.find((v) => v === rawValue)

  invariant(value != null, 'Could not find value in enum')

  return value
}

export const getEnumValue = <V, T extends Record<string, V>>(
  base: T,
  data: FormData,
  key: string,
): V => {
  const value = getOptionalEnumValue<V, T>(base, data, key)

  invariant(value != null, 'Could not find value in enum')

  return value
}
