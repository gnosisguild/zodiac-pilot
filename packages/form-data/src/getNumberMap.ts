import { getMap } from './getMap'
import { getNumber } from './getNumber'

type GetNumberMapOptions<T> = {
  mapValue?: (value: number) => T
}

export function getNumberMap<T = number>(
  data: FormData,
  key: string,
  { mapValue }: GetNumberMapOptions<T> = {},
): Record<string, T> {
  const map = getMap(data, key, { getValue: getNumber })

  if (mapValue == null) {
    return map as Record<string, T>
  }

  return Object.entries(map).reduce<Record<string, T>>(
    (result, [key, value]) => ({ ...result, [key]: mapValue(value) }),
    {},
  )
}
