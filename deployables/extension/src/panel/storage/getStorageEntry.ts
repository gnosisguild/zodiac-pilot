type GetStorageEntryOptions = {
  key: string
  collection?: string
}

export const getStorageEntry = async <T>({
  key,
  collection,
}: GetStorageEntryOptions): Promise<T | null> => {
  const values = await chrome.storage.sync.get(
    collection ? `${collection}[${key}]` : key,
  )
  const [value] = Object.values(values)

  if (value == null) {
    return null
  }

  return value
}
