import { invariant } from '@epic-web/invariant'
import { PrefixedAddress, verifyPrefixedAddress } from '@zodiac/schema'
import { getOptionalString } from './getOptionalString'

export const getOptionalPrefixedAddress = (data: FormData, key: string) => {
  const value = getOptionalString(data, key)

  if (value == null) {
    return null
  }

  return verifyPrefixedAddress(value)
}

export const getPrefixedAddress = (
  data: FormData,
  key: string,
): PrefixedAddress => {
  const value = getOptionalPrefixedAddress(data, key)

  invariant(value != null, `value under "${key}" is not present`)

  return value
}

export const getPrefixedAddressList = (
  data: FormData,
  key: string,
): PrefixedAddress[] => {
  const values = data.getAll(key)

  return values.reduce<PrefixedAddress[]>((result, value) => {
    if (typeof value !== 'string') {
      return result
    }

    if (value.trim() === '') {
      return result
    }

    return [...result, verifyPrefixedAddress(value)]
  }, [])
}
