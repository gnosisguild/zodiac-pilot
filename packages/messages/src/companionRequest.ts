import {
  CompanionAppMessageType,
  type CompanionAppMessage,
} from './companionApp'
import {
  CompanionResponseMessageType,
  type CompanionResponseMessage,
} from './extension'

const requestResponseTypes = {
  [CompanionAppMessageType.SAVE_ROUTE]:
    CompanionResponseMessageType.PROVIDE_ROUTE,
  [CompanionAppMessageType.SAVE_AND_LAUNCH]:
    CompanionResponseMessageType.PROVIDE_ROUTE,
  [CompanionAppMessageType.OPEN_PILOT]: null,
  [CompanionAppMessageType.SUBMIT_SUCCESS]: null,
  [CompanionAppMessageType.REQUEST_FORK_INFO]:
    CompanionResponseMessageType.FORK_UPDATED,
  [CompanionAppMessageType.PING]: CompanionResponseMessageType.PONG,
  [CompanionAppMessageType.REQUEST_VERSION]:
    CompanionResponseMessageType.PROVIDE_VERSION,
  [CompanionAppMessageType.REQUEST_ROUTES]:
    CompanionResponseMessageType.LIST_ROUTES,
  [CompanionAppMessageType.REQUEST_ROUTE]:
    CompanionResponseMessageType.PROVIDE_ROUTE,
  [CompanionAppMessageType.DELETE_ROUTE]:
    CompanionResponseMessageType.DELETED_ROUTE,
  [CompanionAppMessageType.REQUEST_ACTIVE_ROUTE]:
    CompanionResponseMessageType.PROVIDE_ACTIVE_ROUTE,
} as const

export type RequestResponseTypes = {
  [CompanionAppMessageType.SAVE_ROUTE]: Extract<
    CompanionResponseMessage,
    { type: CompanionResponseMessageType.PROVIDE_ROUTE }
  >
  [CompanionAppMessageType.SAVE_AND_LAUNCH]: Extract<
    CompanionResponseMessage,
    { type: CompanionResponseMessageType.PROVIDE_ROUTE }
  >
  [CompanionAppMessageType.OPEN_PILOT]: null
  [CompanionAppMessageType.SUBMIT_SUCCESS]: null
  [CompanionAppMessageType.REQUEST_FORK_INFO]: Extract<
    CompanionResponseMessage,
    { type: CompanionResponseMessageType.FORK_UPDATED }
  >
  [CompanionAppMessageType.PING]: Extract<
    CompanionResponseMessage,
    { type: CompanionResponseMessageType.PONG }
  >
  [CompanionAppMessageType.REQUEST_VERSION]: Extract<
    CompanionResponseMessage,
    { type: CompanionResponseMessageType.PROVIDE_VERSION }
  >
  [CompanionAppMessageType.REQUEST_ROUTES]: Extract<
    CompanionResponseMessage,
    { type: CompanionResponseMessageType.LIST_ROUTES }
  >
  [CompanionAppMessageType.REQUEST_ROUTE]: Extract<
    CompanionResponseMessage,
    { type: CompanionResponseMessageType.PROVIDE_ROUTE }
  >
  [CompanionAppMessageType.DELETE_ROUTE]: Extract<
    CompanionResponseMessage,
    { type: CompanionResponseMessageType.DELETED_ROUTE }
  >
  [CompanionAppMessageType.REQUEST_ACTIVE_ROUTE]: Extract<
    CompanionResponseMessage,
    { type: CompanionResponseMessageType.PROVIDE_ACTIVE_ROUTE }
  >
}

export type RequestResponse = typeof requestResponseTypes

export type Handler<Type extends CompanionAppMessageType> = (
  response: Type extends null ? null : RequestResponseTypes[Type],
) => void

export function companionRequest<Type extends CompanionAppMessageType>(
  message: Extract<CompanionAppMessage, { type: Type }>,
  handler: Handler<Type>,
) {
  const expectedResponseType = requestResponseTypes[message.type]

  if (expectedResponseType == null) {
    window.postMessage(message, '*')

    return
  }

  const handleMessage = (event: MessageEvent<CompanionResponseMessage>) => {
    if (event.data == null) {
      return
    }

    if (event.data.type !== expectedResponseType) {
      return
    }

    window.removeEventListener('message', handleMessage)

    handler(event.data as Extract<CompanionResponseMessage, { type: Type }>)
  }

  window.addEventListener('message', handleMessage)

  window.postMessage(message, '*')

  return () => {
    window.removeEventListener('message', handleMessage)
  }
}
