import {
  CompanionAppMessageType,
  type CompanionAppMessage,
} from '@zodiac/messages'

window.addEventListener(
  'message',
  (event: MessageEvent<CompanionAppMessage>) => {
    if (event.data.type !== CompanionAppMessageType.SAVE_ROUTE) {
      return
    }

    chrome.runtime.sendMessage(event.data)
  },
)
