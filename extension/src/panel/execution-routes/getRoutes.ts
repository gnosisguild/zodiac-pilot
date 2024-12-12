import type { ExecutionRoute } from '@/types'
import { getStorageEntries } from '../utils'

export const getRoutes = async () => {
  const routes = await getStorageEntries<ExecutionRoute>('routes')

  return Object.values(routes)
}
