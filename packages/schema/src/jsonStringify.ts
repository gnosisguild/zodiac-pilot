export const jsonStringify = (value: unknown, indent?: number) =>
  JSON.stringify(
    value,
    (_, value) => {
      if (typeof value === 'bigint') {
        return `bigint::${value.toString()}`
      }

      if (Number.isNaN(value)) {
        return 'number::NaN'
      }

      return value
    },
    indent,
  )
