import { CompanionAppMessageType, companionRequest } from '@zodiac/messages'
import { sortRoutes } from '@zodiac/modules'
import type { ExecutionRoute } from '@zodiac/schema'

export const loadRoutes = () => {
  const { promise, resolve } = Promise.withResolvers<ExecutionRoute[]>()

  companionRequest(
    {
      type: CompanionAppMessageType.REQUEST_ROUTES,
    },
    (response) => resolve(response.routes.toSorted(sortRoutes)),
  )

  return promise
}
