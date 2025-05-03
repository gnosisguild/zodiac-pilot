import { getOptionalString } from './getOptionalString'

export const getOptionalNumber = (data: FormData, key: string) => {
  const value = getOptionalString(data, key)

  if (value == null) {
    return null
  }

  if (value.trim() === '') {
    return null
  }

  const numberValue = Number(value)

  if (Number.isNaN(numberValue)) {
    return null
  }

  return numberValue
}
