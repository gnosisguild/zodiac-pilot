import { captureLastError } from '@/sentry'
import { injectScript } from '@/utils'
import {
  CompanionAppMessageType,
  PilotMessageType,
  type CompanionAppMessage,
  type Message,
} from '@zodiac/messages'

window.addEventListener(
  'message',
  (event: MessageEvent<CompanionAppMessage>) => {
    if (
      event.data.type !== CompanionAppMessageType.SAVE_ROUTE &&
      event.data.type !== CompanionAppMessageType.OPEN_PILOT &&
      event.data.type !== CompanionAppMessageType.SUBMIT_SUCCESS &&
      event.data.type !== CompanionAppMessageType.REQUEST_FORK_INFO
    ) {
      return
    }

    chrome.runtime.sendMessage(event.data, () => {
      captureLastError()
    })
  },
)

chrome.runtime.onMessage.addListener(
  (message: Message | CompanionAppMessage) => {
    switch (message.type) {
      case PilotMessageType.PILOT_CONNECT: {
        console.debug('Companion App is trying to connect...')

        chrome.runtime.sendMessage({
          type: CompanionAppMessageType.REQUEST_FORK_INFO,
        })

        break
      }

      case CompanionAppMessageType.FORK_UPDATED: {
        console.debug('Received fork update. Relaying to injected script...')

        window.postMessage(message, '*')

        break
      }
    }
  },
)

chrome.runtime.sendMessage({ type: CompanionAppMessageType.REQUEST_FORK_INFO })

injectScript('./build/companion/injectedScripts/main.js')
