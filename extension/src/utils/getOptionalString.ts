export const getOptionalString = (
  data: FormData,
  key: string,
): string | undefined => {
  const value = data.get(key)

  if (typeof value === 'string') {
    return value
  }
}
