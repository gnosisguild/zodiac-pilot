import type { ExecutionRoute } from '@zodiac/schema'

export enum CompanionAppMessageType {
  SAVE_ROUTE = 'SAVE_ROUTE',
  OPEN_PILOT = 'OPEN_PILOT',
  SUBMIT_SUCCESS = 'SUBMIT_SUCCESS',
  FORK_UPDATED = 'FORK_UPDATED',
}

type CompanionAppSaveRouteMessage = {
  type: CompanionAppMessageType.SAVE_ROUTE
  data: ExecutionRoute
}

type CompanionAppOpenPilotMessage = {
  type: CompanionAppMessageType.OPEN_PILOT
}

type CompanionAppSubmitSuccessMessage = {
  type: CompanionAppMessageType.SUBMIT_SUCCESS
}

type CompanionAppForkUpdateMessage = {
  type: CompanionAppMessageType.FORK_UPDATED
  forkUrl: string | null
}

export type CompanionAppMessage =
  | CompanionAppSaveRouteMessage
  | CompanionAppOpenPilotMessage
  | CompanionAppSubmitSuccessMessage
  | CompanionAppForkUpdateMessage
