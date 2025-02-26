import type { CompanionAppMessage } from './companionApp'
import type {
  CompanionResponseMessage,
  InjectedProviderMessage,
  Message,
  RpcMessage,
  SimulationMessage,
} from './extension'

export type AllMessages =
  | Message
  | CompanionAppMessage
  | CompanionResponseMessage
  | SimulationMessage
  | InjectedProviderMessage
  | RpcMessage

export type ResponseFn = (response: unknown) => void

type HandlerOptions = {
  tabId: number
  windowId: number
  sendResponse: ResponseFn
}

export type HandlerFn<Message> = (
  message: Message,
  options: HandlerOptions,
) => void

export function createMessageHandler<
  Type extends AllMessages['type'],
  Message = Extract<AllMessages, { type: Type }>,
>(type: Type | Type[], handler: HandlerFn<Message>) {
  return function handleMessage(
    message: AllMessages,
    { id, tab }: chrome.runtime.MessageSender,
    sendResponse: ResponseFn,
  ) {
    if (id !== chrome.runtime.id) {
      return
    }

    if (tab == null || tab.id == null) {
      return
    }

    if (Array.isArray(type)) {
      if (type.every((type) => type !== message.type)) {
        return
      }
    } else {
      if (message.type !== type) {
        return
      }
    }

    return handler(message as Message, {
      tabId: tab.id,
      windowId: tab.windowId,
      sendResponse,
    })
  }
}
