import { jsonParse } from '@zodiac/schema'
import type { AllMessages, ResponseFn } from './createTabMessageHandler'

type HandlerOptions = {
  sendResponse: ResponseFn
}

type HandlerFn<Message> = (message: Message, options: HandlerOptions) => void

export function createInternalMessageHandler<
  Type extends AllMessages['type'],
  Message = Extract<AllMessages, { type: Type }>,
>(type: Type | Type[], handler: HandlerFn<Message>) {
  return function handleMessage(
    message: AllMessages,
    { id }: chrome.runtime.MessageSender,
    sendResponse: ResponseFn,
  ) {
    if (id !== chrome.runtime.id) {
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

    return handler(jsonParse<Message>(message), {
      sendResponse,
    })
  }
}
