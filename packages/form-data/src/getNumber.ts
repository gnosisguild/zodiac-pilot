import { invariant } from '@epic-web/invariant'
import { getOptionalNumber } from './getOptionalNumber'

export const getNumber = (data: FormData, key: string): number => {
  const value = getOptionalNumber(data, key)

  invariant(
    value != null,
    `Value under "${key}" could not be parsed to a number`,
  )

  return value
}
