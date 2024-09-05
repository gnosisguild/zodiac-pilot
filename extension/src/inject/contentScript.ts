import './probeChainId'
import {
  INJECTED_PROVIDER_EVENT,
  INJECTED_PROVIDER_REQUEST,
  InjectedProviderMessage,
  InjectedProviderResponse,
} from './messages'
import { Message, PILOT_DISCONNECT } from '../messages'

function inject(scriptPath: string) {
  const node = document.createElement('script')
  node.type = 'text/javascript'
  node.async = false
  node.src = chrome.runtime.getURL(scriptPath)

  if ('__zodiacPilotInjected' in document.documentElement.dataset) {
    // another installation of the extension has already injected itself
    // (this can happen when when loading unpacked extensions)
    return
  }
  document.documentElement.dataset.__zodiacPilotInjected = 'true'
  document.documentElement.dataset.__zodiacPilotConnected = 'true'

  const parent = document.head || document.documentElement
  parent.insertBefore(node, parent.children[0])
  node.remove()
}

if (
  window.location.origin !== 'https://connect.pilot.gnosisguild.org' &&
  !window.location.href.startsWith('about:') &&
  !window.location.href.startsWith('chrome:')
) {
  inject('build/inject/injectedScript.js')

  // relay rpc requests from the InjectedProvider in the tab to the Eip1193Provider in the panel
  window.addEventListener(
    'message',
    async (event: MessageEvent<InjectedProviderMessage>) => {
      const message = event.data
      if (!message) return

      if (message.type === INJECTED_PROVIDER_REQUEST) {
        const { requestId, request } = message
        console.debug('rpc request to pilot', requestId, request)
        const responseMessage: InjectedProviderResponse | undefined =
          await chrome.runtime.sendMessage(message)

        // This can happen if the panel is closed before the response is received
        if (!responseMessage) return

        const { response } = responseMessage
        console.debug('rpc response from pilot', requestId, response)
        window.postMessage(responseMessage, '*')
      }
    }
  )

  // Relay panel toggling and events from the Eip1193Provider in the panel to the InjectedProvider in the tab
  chrome.runtime.onMessage.addListener(
    (message: InjectedProviderMessage | Message, sender) => {
      if (sender.id !== chrome.runtime.id) return

      // when the panel is closed, we trigger an EIP1193 'disconnect' event
      if (message.type === PILOT_DISCONNECT) {
        console.debug('Pilot disconnected')
        window.postMessage(
          {
            type: INJECTED_PROVIDER_EVENT,
            eventName: 'disconnect',
            eventData: {
              error: {
                message: 'Zodiac Pilot disconnected',
                code: 4900,
              },
            },
          } as InjectedProviderMessage,
          '*'
        )
      }

      if (message.type === INJECTED_PROVIDER_EVENT) {
        console.debug('eip1193 event from pilot', message)
        window.postMessage(message, '*')
      }
    }
  )
}

export {}
