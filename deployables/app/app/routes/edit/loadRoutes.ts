import { CompanionAppMessageType, companionRequest } from '@zodiac/messages'
import type { ExecutionRoute } from '@zodiac/schema'

export const loadRoutes = () => {
  const { promise, resolve } = Promise.withResolvers<ExecutionRoute[]>()

  companionRequest(
    {
      type: CompanionAppMessageType.REQUEST_ROUTES,
    },
    (response) =>
      resolve(
        response.routes.toSorted((a, b) => {
          if (a.label == null && b.label == null) {
            return 0
          }

          if (a.label == null) {
            return -1
          }

          if (b.label == null) {
            return 1
          }

          return a.label.localeCompare(b.label)
        }),
      ),
  )

  return promise
}
