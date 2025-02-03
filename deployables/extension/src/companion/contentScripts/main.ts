import { captureLastError } from '@/sentry'
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
      event.data.type !== CompanionAppMessageType.OPEN_PILOT &&
      event.data.type !== CompanionAppMessageType.SUBMIT_SUCCESS
    ) {
      return
    }

    chrome.runtime.sendMessage(event.data, () => {
      captureLastError()
    })
  },
)

chrome.runtime.onMessage.addListener((message: CompanionAppMessage) => {
  if (message.type !== CompanionAppMessageType.FORK_UPDATED) {
    return
  }

  window.postMessage(message)
})

injectScript('./build/companion/injectedScripts/main.js')
