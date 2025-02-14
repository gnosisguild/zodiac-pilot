import { captureLastError } from '@/sentry'
import { injectScript } from '@/utils'
import {
  CompanionAppMessageType,
  CompanionResponseMessageType,
  PilotMessageType,
  type CompanionAppMessage,
  type CompanionResponseMessage,
  type Message,
} from '@zodiac/messages'

window.addEventListener(
  'message',
  (event: MessageEvent<CompanionAppMessage>) => {
    switch (event.data.type) {
      case CompanionAppMessageType.SAVE_ROUTE:
      case CompanionAppMessageType.SAVE_AND_LAUNCH:
      case CompanionAppMessageType.OPEN_PILOT:
      case CompanionAppMessageType.SUBMIT_SUCCESS:
      case CompanionAppMessageType.REQUEST_FORK_INFO:
      case CompanionAppMessageType.REQUEST_ROUTES:
      case CompanionAppMessageType.REQUEST_ROUTE:
      case CompanionAppMessageType.PING: {
        chrome.runtime.sendMessage(event.data, () => {
          captureLastError()
        })

        break
      }

      case CompanionAppMessageType.REQUEST_VERSION: {
        const manifest = chrome.runtime.getManifest()

        window.postMessage(
          {
            type: CompanionResponseMessageType.PROVIDE_VERSION,
            version: manifest.version,
          } satisfies CompanionResponseMessage,
          '*',
        )
      }
    }
  },
)

chrome.runtime.onMessage.addListener(
  (message: Message | CompanionResponseMessage) => {
    switch (message.type) {
      case PilotMessageType.PILOT_CONNECT: {
        console.debug('Companion App is trying to connect...')

        chrome.runtime.sendMessage({
          type: CompanionAppMessageType.REQUEST_FORK_INFO,
        })

        window.postMessage(message, '*')

        break
      }

      case CompanionResponseMessageType.FORK_UPDATED:
      case CompanionResponseMessageType.PONG:
      case CompanionResponseMessageType.LIST_ROUTES:
      case CompanionResponseMessageType.PROVIDE_ROUTE:
      case PilotMessageType.PILOT_DISCONNECT: {
        window.postMessage(message, '*')

        break
      }
    }
  },
)

chrome.runtime.sendMessage<CompanionAppMessage>({
  type: CompanionAppMessageType.REQUEST_FORK_INFO,
})

injectScript('./build/companion/injectedScripts/main.js')
