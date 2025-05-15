import { getStorageEntry } from '@/storage'
import { type ExecutionRoute } from '@/types'

export const findRoute = async (routeId: string) => {
  const route = await getStorageEntry<ExecutionRoute | undefined>({
    collection: 'routes',
    key: routeId,
  })

  return route
}
