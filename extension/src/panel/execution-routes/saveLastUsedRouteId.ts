import { saveStorageEntry } from '../utils'

export const saveLastUsedRouteId = (routeId: string | null) =>
  saveStorageEntry({ key: 'lastUsedRoute', value: routeId })
