import type { ExecutionRoute } from '@zodiac/schema'

export enum CompanionAppMessageType {
  SAVE_ROUTE = 'SAVE_ROUTE',
}

type CompanionAppSaveRouteMessage = {
  type: CompanionAppMessageType.SAVE_ROUTE
  data: ExecutionRoute
}

export type CompanionAppMessage = CompanionAppSaveRouteMessage
