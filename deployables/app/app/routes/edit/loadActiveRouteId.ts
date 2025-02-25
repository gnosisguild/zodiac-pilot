import { CompanionAppMessageType, companionRequest } from '@zodiac/messages'

export const loadActiveRouteId = () => {
  const { promise, resolve } = Promise.withResolvers<string | null>()

  companionRequest(
    { type: CompanionAppMessageType.REQUEST_ACTIVE_ROUTE },
    ({ activeRouteId }) => resolve(activeRouteId),
  )

  return promise
}
