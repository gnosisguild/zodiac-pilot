import { getMap } from './getMap'
import { getOptionalNumber } from './getOptionalNumber'

type GetNumberMapOptions<T> = {
  mapValue?: (value: number) => T
}

export function getNumberMap<T = number>(
  data: FormData,
  key: string,
  { mapValue }: GetNumberMapOptions<T> = {},
): Record<string, T> {
  const map = getMap(data, key, { getValue: getOptionalNumber })

  if (mapValue == null) {
    return Object.entries(map).reduce<Record<string, T>>(
      (result, [key, value]) => {
        if (value == null) {
          return result
        }

        return { ...result, [key]: value } as Record<string, T>
      },
      {},
    )
  }

  return Object.entries(map).reduce<Record<string, T>>(
    (result, [key, value]) => {
      if (value == null) {
        return result
      }

      return { ...result, [key]: mapValue(value) }
    },
    {},
  )
}
