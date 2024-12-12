import { saveStorageEntry } from '../utils'

export const saveLastUsedRouteId = (routeId: string) =>
  saveStorageEntry({ key: 'lastUsedRoute', value: routeId })
