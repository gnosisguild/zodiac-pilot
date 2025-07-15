import { captureLastError } from '@/sentry'
import {
  CompanionAppMessageType,
  CompanionResponseMessageType,
  createClientMessageHandler,
  PilotMessageType,
  type CompanionAppMessage,
  type CompanionResponseMessage,
} from '@zodiac/messages'

window.addEventListener(
  'message',
  async (event: MessageEvent<CompanionAppMessage>) => {
    switch (event.data.type) {
      case CompanionAppMessageType.SAVE_ROUTE:
      case CompanionAppMessageType.SAVE_AND_LAUNCH:
      case CompanionAppMessageType.OPEN_PILOT:
      case CompanionAppMessageType.SUBMIT_SUCCESS:
      case CompanionAppMessageType.REQUEST_FORK_INFO:
      case CompanionAppMessageType.REQUEST_ROUTES:
      case CompanionAppMessageType.REQUEST_ROUTE:
      case CompanionAppMessageType.DELETE_ROUTE:
      case CompanionAppMessageType.REQUEST_ACTIVE_ROUTE:
      case CompanionAppMessageType.PING: {
        await chrome.runtime.sendMessage<CompanionAppMessage>(event.data)

        captureLastError()

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
  createClientMessageHandler(PilotMessageType.PILOT_CONNECT, (message) => {
    console.debug('Companion App is trying to connect...')

    chrome.runtime.sendMessage<CompanionAppMessage>({
      type: CompanionAppMessageType.REQUEST_FORK_INFO,
    })

    window.postMessage(message, '*')
  }),
)

chrome.runtime.onMessage.addListener(
  createClientMessageHandler(
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

export default {}
