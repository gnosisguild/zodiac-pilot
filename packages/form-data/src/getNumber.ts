import { invariant } from '@epic-web/invariant'

export const getNumber = (data: FormData, key: string): number => {
  const value = data.get(key)

  invariant(value != null, `Value under "${key}" is null.`)

  const numberValue = Number(value)

  invariant(!Number.isNaN(numberValue), `Value under '${key}" is not a number.`)

  return numberValue
}
