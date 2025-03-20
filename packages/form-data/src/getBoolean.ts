import { getOptionalString } from './getOptionalString'

export const getBoolean = (data: FormData, key: string): boolean => {
  const value = getOptionalString(data, key)

  return value === 'on'
}
