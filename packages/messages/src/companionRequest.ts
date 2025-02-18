import {
  CompanionAppMessageType,
  type CompanionAppMessage,
} from './companionApp'
import {
  CompanionResponseMessageType,
  type CompanionResponseMessage,
} from './extension'

const requestResponseTypes = {
  [CompanionAppMessageType.SAVE_ROUTE]: null,
  [CompanionAppMessageType.SAVE_AND_LAUNCH]: null,
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
} as const

type RequestResponse = typeof requestResponseTypes

type Handler<Type extends CompanionResponseMessageType | null> = (
  response: Type extends null
    ? null
    : Extract<CompanionResponseMessage, { type: Type }>,
) => void

export function companionRequest<Type extends CompanionAppMessageType>(
  message: Extract<CompanionAppMessage, { type: Type }>,
  handler: Handler<RequestResponse[Type]>,
) {
  const expectedResponseType = requestResponseTypes[message.type]

  console.log({ expectedResponseType })

  if (expectedResponseType == null) {
    window.postMessage(message, '*')

    return
  }

  const handleMessage = (event: MessageEvent<CompanionResponseMessage>) => {
    if (event.data == null) {
      return
    }

    console.log(event.data)
    if (event.data.type !== expectedResponseType) {
      return
    }

    handler(event.data as Extract<CompanionResponseMessage, { type: Type }>)
  }

  window.addEventListener('message', handleMessage)

  window.postMessage(message, '*')

  return () => {
    window.removeEventListener('message', handleMessage)
  }
}
