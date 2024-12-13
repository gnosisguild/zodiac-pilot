import { saveRoute } from '@/execution-routes'
import type { ExecutionRoute } from '@/types'
import { createMockRoute } from '../creators'

export const mockRoute = (route: Partial<ExecutionRoute> = {}) => {
  const mockRoute = createMockRoute(route)

  return saveRoute(mockRoute)
}
