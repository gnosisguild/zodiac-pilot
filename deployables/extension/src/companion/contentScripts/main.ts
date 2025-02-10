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
    switch (event.data.type) {
      case CompanionAppMessageType.SAVE_ROUTE:
      case CompanionAppMessageType.OPEN_PILOT:
      case CompanionAppMessageType.SUBMIT_SUCCESS:
      case CompanionAppMessageType.REQUEST_FORK_INFO:
      case CompanionAppMessageType.REQUEST_ROUTES:
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
            type: PilotMessageType.PROVIDE_VERSION,
            version: manifest.version,
          } satisfies Message,
          '*',
        )
      }
    }
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

        window.postMessage(message, '*')

        break
      }

      case CompanionAppMessageType.FORK_UPDATED:
      case PilotMessageType.PONG:
      case CompanionAppMessageType.LIST_ROUTES:
      case PilotMessageType.PILOT_DISCONNECT: {
        window.postMessage(message, '*')

        break
      }
    }
  },
)

chrome.runtime.sendMessage({ type: CompanionAppMessageType.REQUEST_FORK_INFO })

injectScript('./build/companion/injectedScripts/main.js')
