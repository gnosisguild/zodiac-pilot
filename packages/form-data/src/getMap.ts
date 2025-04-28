type GetMapOptions<Value> = {
  getValue: (data: FormData, key: string) => Value
}

export const getMap = <V>(
  data: FormData,
  name: string,
  { getValue }: GetMapOptions<V>,
) =>
  Array.from(data.keys())
    .filter((key) => key.startsWith(`${name}[`))
    .reduce<Record<string, V>>((acc, key) => {
      const processedKey = key.slice(`${name}[`.length, -1)

      return { ...acc, [processedKey]: getValue(data, key) }
    }, {})
