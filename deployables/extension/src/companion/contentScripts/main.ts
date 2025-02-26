import { captureLastError } from '@/sentry'
import { injectScript } from '@/utils'
import {
  CompanionAppMessageType,
  CompanionResponseMessageType,
  createMessageHandler,
  PilotMessageType,
  type CompanionAppMessage,
  type CompanionResponseMessage,
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
      case CompanionAppMessageType.DELETE_ROUTE:
      case CompanionAppMessageType.LAUNCH_ROUTE:
      case CompanionAppMessageType.REQUEST_ACTIVE_ROUTE:
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
  createMessageHandler(PilotMessageType.PILOT_CONNECT, (message) => {
    console.debug('Companion App is trying to connect...')

    chrome.runtime.sendMessage({
      type: CompanionAppMessageType.REQUEST_FORK_INFO,
    })

    window.postMessage(message, '*')
  }),
)

chrome.runtime.onMessage.addListener(
  createMessageHandler(
    [
      CompanionResponseMessageType.FORK_UPDATED,
      CompanionResponseMessageType.PONG,
      CompanionResponseMessageType.LIST_ROUTES,
      CompanionResponseMessageType.PROVIDE_ROUTE,
      CompanionResponseMessageType.DELETED_ROUTE,
      CompanionResponseMessageType.PROVIDE_ACTIVE_ROUTE,
      PilotMessageType.PILOT_DISCONNECT,
    ],
    (message) => {
      window.postMessage(message, '*')
    },
  ),
)

injectScript('./build/companion/injectedScripts/main.js')
