export function getStorageEntries<T>(collection: string) {
  const { promise, resolve } = Promise.withResolvers<{ [key: string]: T }>()

  chrome.storage.sync.get<{ [key: string]: T }>((allEntries) => {
    const matchingEntries = Object.entries(allEntries)
      .map(([itemKey, value]) => {
        const match = itemKey.match(new RegExp(`${collection}\\[(.+)\\]`))

        if (!match) return null
        return [match[1], value]
      })
      .filter(Boolean) as [string, T][]

    resolve(Object.fromEntries(matchingEntries))
  })

  return promise
}
