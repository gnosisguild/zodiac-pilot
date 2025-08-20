import { jsonStringify } from './jsonStringify'

export const jsonParse = <T>(value: unknown): T => {
  return JSON.parse(
    typeof value === 'string' ? value : jsonStringify(value),
    (_, value) => {
      if (typeof value === 'string') {
        if (value.startsWith('bigint::')) {
          return BigInt(value.replace('bigint::', ''))
        }

        if (value === 'number::NaN') {
          return NaN
        }
      }

      return value
    },
  )
}
