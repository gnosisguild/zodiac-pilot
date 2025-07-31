import { invariant } from '@epic-web/invariant'
import { getString } from './getString'

export const getEnumValue = <V, T extends Record<string, V>>(
  base: T,
  data: FormData,
  key: string,
): V => {
  const rawValue = getString(data, key)

  const values = Object.values(base)

  const value = values.find((v) => v === rawValue)

  invariant(value != null, 'Could not find value in enum')

  return value
}
