import { safeJson } from '@zodiac/schema'
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

// Derived types to split CompanionAppMessageType into two categories
type CompanionAppMessageTypeWithResponse = {
  [K in CompanionAppMessageType]: RequestResponseTypes[K] extends null
    ? never
    : K
}[CompanionAppMessageType]

type CompanionAppMessageTypeWithoutResponse = {
  [K in CompanionAppMessageType]: RequestResponseTypes[K] extends null
    ? K
    : never
}[CompanionAppMessageType]

/**
 * Helper for sending messages from the companion app to the extension.
 */
// Overload for notification messages (no response expected)
export function companionRequest<
  Type extends CompanionAppMessageTypeWithoutResponse,
>(message: Extract<CompanionAppMessage, { type: Type }>): void

// Overload for request messages (response expected)
export function companionRequest<
  Type extends CompanionAppMessageTypeWithResponse,
>(
  message: Extract<CompanionAppMessage, { type: Type }>,
  handler: (response: RequestResponseTypes[Type]) => void,
): () => void

export function companionRequest(message: CompanionAppMessage, handler?: any) {
  const expectedResponseType = requestResponseTypes[message.type]

  if (expectedResponseType == null) {
    window.postMessage(message, '*')

    return
  }

  if (!handler) {
    throw new Error(`Handler required for message type: ${message.type}`)
  }

  const handleMessage = (event: MessageEvent<CompanionResponseMessage>) => {
    if (event.data == null) {
      return
    }

    if (event.data.type !== expectedResponseType) {
      return
    }

    window.removeEventListener('message', handleMessage)

    handler(event.data)
  }

  window.addEventListener('message', handleMessage)

  // TODO: remove when 3.20.1 reaches saturation
  window.postMessage(safeJson(message, { noInternalRepresentation: true }), '*')

  return () => {
    window.removeEventListener('message', handleMessage)
  }
}

export function autoRespondToCompanionRequest<
  Type extends CompanionAppMessageType,
>(messageType: Type, response: RequestResponseTypes[Type]) {
  const { promise, resolve } = Promise.withResolvers<void>()

  const handleRequest = (event: MessageEvent<CompanionAppMessage>) => {
    if (event.data == null) {
      return
    }

    if (event.data.type !== messageType) {
      return
    }

    window.removeEventListener('message', handleRequest)
    window.postMessage(
      // TODO: remove when 3.20.1 reaches saturation
      safeJson(response, { noInternalRepresentation: true }),
      '*',
    )

    resolve()
  }

  window.addEventListener('message', handleRequest)

  return promise
}
