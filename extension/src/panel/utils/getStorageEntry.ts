export const getStorageEntry = async <T>(key: string): Promise<T> => {
  const values = await chrome.storage.sync.get(key)
  const [value] = Object.values(values)

  return value
}
