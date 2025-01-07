import { invariant } from '@epic-web/invariant'

export const getString = (data: FormData, key: string): string => {
  const value = data.get(key)

  invariant(typeof value === 'string', `Value under "${key}" is not a string`)

  return value
}
