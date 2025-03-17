import type {
  CompanionAppMessage,
  CompanionResponseMessage,
  Message,
} from '@zodiac/messages'
import { createPostMessage } from '@zodiac/test-utils'

export const postMessage = createPostMessage<
  CompanionAppMessage | CompanionResponseMessage | Message
>()
