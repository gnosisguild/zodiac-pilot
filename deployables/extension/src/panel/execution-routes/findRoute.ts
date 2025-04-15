import { type ExecutionRoute } from '@/types'
import { getStorageEntry } from '../utils'

export const findRoute = async (routeId: string) => {
  const route = await getStorageEntry<ExecutionRoute | undefined>({
    collection: 'routes',
    key: routeId,
  })

  return route
}
