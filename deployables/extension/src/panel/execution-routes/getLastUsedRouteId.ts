import { getStorageEntry } from '@/storage'

export const getLastUsedRouteId = () =>
  getStorageEntry<string | null>({ key: 'lastUsedRoute' })
