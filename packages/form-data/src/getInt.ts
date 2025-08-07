import { getOptionalString } from './getOptionalString'
import { getString } from './getString'

export const getOptionalInt = (data: FormData, key: string): number | null => {
  const stringValue = getOptionalString(data, key)

  if (stringValue == null) {
    return null
  }

  if (stringValue.trim() === '') {
    return null
  }

  return parseInt(stringValue)
}

export const getInt = (data: FormData, key: string): number => {
  const stringValue = getString(data, key)

  return parseInt(stringValue)
}
