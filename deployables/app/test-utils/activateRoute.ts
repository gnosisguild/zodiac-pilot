import { CompanionResponseMessageType } from '@zodiac/messages'
import { postMessage } from './postMessage'

export const activateRoute = (routeId: string) =>
  postMessage({
    type: CompanionResponseMessageType.PROVIDE_ACTIVE_ROUTE,
    activeRouteId: routeId,
  })
