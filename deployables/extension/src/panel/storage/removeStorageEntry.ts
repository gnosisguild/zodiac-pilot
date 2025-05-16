type RemoveStorageEntryOptions = {
  key: string
  collection?: string
}

export const removeStorageEntry = ({
  collection,
  key,
}: RemoveStorageEntryOptions) =>
  chrome.storage.sync.remove(collection != null ? `${collection}[${key}]` : key)
