export type SearchParams = Record<string, string | number | null | undefined>

export const getCurrentPath = (path: string, searchParams: SearchParams) => {
  const url = new URL(path, 'http://localhost')

  Object.entries(searchParams).forEach(([key, value]) => {
    if (value == null) {
      url.searchParams.delete(key)
    } else if (typeof value === 'number') {
      url.searchParams.set(key, value.toString())
    } else {
      url.searchParams.set(key, value)
    }
  })

  return `${url.pathname}${url.search}`
}
