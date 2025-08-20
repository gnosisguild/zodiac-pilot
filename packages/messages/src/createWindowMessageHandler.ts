import { jsonParse } from '@zodiac/schema'
import type { AllMessages } from './createTabMessageHandler'

export type HandlerFn<Message> = (message: Message) => void

export function createWindowMessageHandler<
  Type extends AllMessages['type'],
  Message = Extract<AllMessages, { type: Type }>,
>(type: Type, handler: HandlerFn<Message>) {
  return function handleMessage(event: MessageEvent<AllMessages>) {
    if (event.data == null) {
      return
    }

    if (event.data.type !== type) {
      return
    }

    handler(jsonParse<Message>(event.data))
  }
}
