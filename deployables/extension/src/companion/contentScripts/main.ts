import { injectScript } from '@/utils'
import {
  CompanionAppMessageType,
  type CompanionAppMessage,
} from '@zodiac/messages'

window.addEventListener(
  'message',
  (event: MessageEvent<CompanionAppMessage>) => {
    if (
      event.data.type !== CompanionAppMessageType.SAVE_ROUTE &&
      event.data.type !== CompanionAppMessageType.OPEN_PILOT
    ) {
      return
    }

    chrome.runtime.sendMessage(event.data)
  },
)

injectScript('./build/companion/injectedScripts/main.js')
