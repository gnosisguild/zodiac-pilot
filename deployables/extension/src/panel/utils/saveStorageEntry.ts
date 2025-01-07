type SaveStorageEntryOptions<T> = {
  collection?: string
  key: string
  value: T
}

export async function saveStorageEntry<T>({
  collection,
  key,
  value,
}: SaveStorageEntryOptions<T>) {
  await chrome.storage.sync.set({
    [collection != null ? `${collection}[${key}]` : key]: value,
  })

  return value
}
