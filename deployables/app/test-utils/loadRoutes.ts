import { CompanionResponseMessageType } from '@zodiac/messages'
import type { ExecutionRoute } from '@zodiac/schema'
import { createMockExecutionRoute } from '@zodiac/test-utils'
import { postMessage } from './postMessage'

export const loadRoutes = async (...routes: Partial<ExecutionRoute>[]) => {
  const mockedRoutes = routes.map(createMockExecutionRoute)

  await postMessage({
    type: CompanionResponseMessageType.LIST_ROUTES,
    routes: mockedRoutes,
  })

  return mockedRoutes
}
