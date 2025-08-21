import { getStorageEntry } from '@/storage'

export const getLastUsedAccountId = () =>
  getStorageEntry<string | null>({ key: 'lastUsedRoute' })
