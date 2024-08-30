import './probeChainId'
import {
  INJECTED_PROVIDER_EVENT,
  INJECTED_PROVIDER_REQUEST,
  PILOT_DISCONNECT,
  Message,
  InjectedProviderResponse,
} from './messages'

// relay rpc requests from the InjectedProvider in the tab to the Eip1193Provider in the panel
window.addEventListener('message', async (event: MessageEvent<Message>) => {
  const message = event.data
  if (!message) return

  if (message.type === INJECTED_PROVIDER_REQUEST) {
    const { requestId, request } = message
    console.debug('rpc request to pilot', requestId, request)
    const responseMessage: InjectedProviderResponse =
      await chrome.runtime.sendMessage(message)
    const { response } = responseMessage
    console.debug('rpc response from pilot', requestId, response)
    window.postMessage(responseMessage, '*')
  }
})

// Relay panel toggling and events from the Eip1193Provider in the panel to the InjectedProvider in the tab
chrome.runtime.onMessage.addListener((message: Message, sender) => {
  if (sender.id !== chrome.runtime.id) return

  // when the panel is closed, we trigger an EIP1193 'close' event
  if (message.type === PILOT_DISCONNECT) {
    console.debug('Pilot disconnected')
    window.postMessage(
      {
        type: INJECTED_PROVIDER_EVENT,
        eventName: 'close',
        eventData: {
          code: 1000, // "Normal Closure" (see codes: https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent/code#value)
          reason: 'Zodiac Pilot disconnected',
        },
      } as Message,
      '*'
    )
  }

  if (message.type === INJECTED_PROVIDER_EVENT) {
    console.debug('eip1193 event from pilot', message)
    window.postMessage(message, '*')
  }
})

export {}
