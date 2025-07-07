import { CompanionResponseMessageType } from '@zodiac/messages'
import { createMockExecutionRoute } from '@zodiac/modules/test-utils'
import type { ExecutionRoute } from '@zodiac/schema'
import { postMessage } from './postMessage'

export const loadRoutes = async (...routes: Partial<ExecutionRoute>[]) => {
  const mockedRoutes = routes.map(createMockExecutionRoute)

  await postMessage({
    type: CompanionResponseMessageType.LIST_ROUTES,
    routes: mockedRoutes,
  })

  return mockedRoutes
}
