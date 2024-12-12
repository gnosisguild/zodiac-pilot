export const getStorageEntry = async (key: string) => {
  const values = await chrome.storage.sync.get(key)
  const [value] = Object.values(values)

  return value
}
