import type { ExecutionRoute } from '@zodiac/schema'

export enum CompanionResponseMessageType {
  PONG = 'EXTENSION::PONG',
  PROVIDE_VERSION = 'EXTENSION::PROVIDE_VERSION',
  // Keep the wrong prefix here to ensure backwards compatibility
  FORK_UPDATED = 'COMPANION::FORK_UPDATED',
  LIST_ROUTES = 'EXTENSION::LIST_ROUTES',
  PROVIDE_ROUTE = 'EXTENSION::PROVIDE_ROUTE',
  DELETED_ROUTE = 'EXTENSION::DELETED_ROUTE',
}

type Pong = {
  type: CompanionResponseMessageType.PONG
}

type ProvideVersion = {
  type: CompanionResponseMessageType.PROVIDE_VERSION
  version: string
}

type ListRoutes = {
  type: CompanionResponseMessageType.LIST_ROUTES
  routes: ExecutionRoute[]
}

type ForkUpdated = {
  type: CompanionResponseMessageType.FORK_UPDATED
  forkUrl: string | null
}

type ProvideRoute = {
  type: CompanionResponseMessageType.PROVIDE_ROUTE
  route: ExecutionRoute
}

type DeletedRoute = {
  type: CompanionResponseMessageType.DELETED_ROUTE
}

export type CompanionResponseMessage =
  | Pong
  | ProvideVersion
  | ListRoutes
  | ForkUpdated
  | ProvideRoute
  | DeletedRoute
