import { removeStorageEntry } from '@/storage'

export const removeRoute = (routeId: string) =>
  removeStorageEntry({ collection: 'routes', key: routeId })
