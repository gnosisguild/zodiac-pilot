import type { ExecutionRoute } from '@zodiac/schema'

export enum CompanionAppMessageType {
  SAVE_ROUTE = 'SAVE_ROUTE',
  OPEN_PILOT = 'OPEN_PILOT',
}

type CompanionAppSaveRouteMessage = {
  type: CompanionAppMessageType.SAVE_ROUTE
  data: ExecutionRoute
}

type CompanionAppOpenPilotMessage = {
  type: CompanionAppMessageType.OPEN_PILOT
}

export type CompanionAppMessage =
  | CompanionAppSaveRouteMessage
  | CompanionAppOpenPilotMessage
