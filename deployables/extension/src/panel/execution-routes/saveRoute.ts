import { saveStorageEntry } from '@/storage'
import type { ExecutionRoute } from '@/types'

export const saveRoute = (route: ExecutionRoute) =>
  saveStorageEntry({
    collection: 'routes',
    key: route.id,
    value: route,
  })
