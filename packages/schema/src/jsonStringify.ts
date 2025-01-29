export const jsonStringify = (value: unknown, indent?: number) =>
  JSON.stringify(
    value,
    (_, value) => {
      if (typeof value === 'bigint') {
        return value.toString()
      }

      return value
    },
    indent,
  )
