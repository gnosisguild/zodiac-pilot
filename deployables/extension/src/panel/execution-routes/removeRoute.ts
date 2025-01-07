import { removeStorageEntry } from '../utils'

export const removeRoute = (routeId: string) =>
  removeStorageEntry({ collection: 'routes', key: routeId })
