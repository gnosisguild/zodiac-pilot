import type { ExecutionRoute } from '@/types'
import { chromeMock } from './chrome'
import { createMockRoute } from './creators'

export const mockRoutes = (...routes: Partial<ExecutionRoute>[]) => {
  const mockedRoutes = routes.map(createMockRoute)

  chromeMock.storage.sync.get.mockImplementation(async (callback) => {
    if (typeof callback === 'function') {
      return callback(
        mockedRoutes.reduce(
          (result, route) => ({ ...result, [`routes[${route.id}]`]: route }),
          {},
        ),
      )
    }

    return null
  })
}
