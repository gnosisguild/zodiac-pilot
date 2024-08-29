import './probeChainId'
import {
  INJECTED_PROVIDER_EVENT,
  INJECTED_PROVIDER_REQUEST,
  PILOT_CONNECT,
  PILOT_DISCONNECT,
  Message,
  InjectedProviderResponse,
} from './messages'

function inject(scriptPath: string) {
  const node = document.createElement('script')
  node.type = 'text/javascript'
  node.async = false
  node.src = chrome.runtime.getURL(scriptPath)

  if (document.documentElement.dataset.__zodiacPilotInjected) {
    // another installation of the extension has already injected itself
    // (this can happen when when loading unpacked extensions)
    return
  }
  document.documentElement.dataset.__zodiacPilotInjected = 'true'

  const parent = document.head || document.documentElement
  parent.insertBefore(node, parent.children[0])
  node.remove()
}

inject('build/inject/injectedScript.js')
console.log('injected injectedScript')

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

  if (message.type === PILOT_CONNECT) {
    console.debug('Pilot connected')
    window.postMessage(message, '*')
  }
  if (message.type === PILOT_DISCONNECT) {
    console.debug('Pilot disconnected')
    window.postMessage(message, '*')
  }

  if (message.type === INJECTED_PROVIDER_EVENT) {
    console.debug('eip1193 event from pilot', message)
    window.postMessage(message, '*')
  }
})

export {}
