type Options = {
  /**
   * To safely pass around data internally within our apps we're representing
   * values like BigInt or NaN with strings and convert them back with `parseJson`.
   * However, when you stringify for a 3rd party you probably don't want to do that.
   * In these scenarios you can set `noInternalRepresentation` to false. This will
   * make sure that, for instance, BigInt is converted to a string but that no extra
   * fluff is added.
   */
  noInternalRepresentation?: boolean
}

export const jsonStringify = (
  value: unknown,
  indent?: number,
  { noInternalRepresentation = false }: Options = {},
) =>
  JSON.stringify(
    value,
    (_, value) => {
      if (noInternalRepresentation) {
        if (typeof value === 'bigint') {
          return value.toString()
        }
      } else {
        if (typeof value === 'bigint') {
          return `bigint::${value.toString()}`
        }

        if (Number.isNaN(value)) {
          return 'number::NaN'
        }
      }

      return value
    },
    indent,
  )
