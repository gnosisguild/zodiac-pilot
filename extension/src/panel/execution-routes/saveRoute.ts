import type { ExecutionRoute } from '@/types'
import { saveStorageEntry } from '../utils/saveStorageEntry'

export const saveRoute = (route: ExecutionRoute) =>
  saveStorageEntry({
    collection: 'routes',
    key: route.id,
    value: route,
  })
