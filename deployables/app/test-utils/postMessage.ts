import type {
  CompanionAppMessage,
  CompanionResponseMessage,
  Message,
} from '@zodiac/messages'
import { sleepTillIdle } from '@zodiac/test-utils'

export const postMessage = (
  message: CompanionAppMessage | CompanionResponseMessage | Message,
) => {
  window.postMessage(message, '*')

  return sleepTillIdle()
}
