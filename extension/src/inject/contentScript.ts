import './probeChainId'
import {
  INJECTED_PROVIDER_EVENT,
  INJECTED_PROVIDER_REQUEST,
  Message,
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

// get the windowId of the tab
// let windowId: number
// chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//   windowId = tabs[0].windowId
// })

// relay rpc requests from the InjectedProvider in the tab to the Eip1193Provider in the panel
window.addEventListener('message', async (event: MessageEvent<Message>) => {
  const message = event.data
  if (!message) return

  if (message.type === INJECTED_PROVIDER_REQUEST) {
    // attach windowId so the event will be handled by the right panel instance
    // message.windowId = windowId
    console.debug('relaying request to panel', message)
    const responseMessage: Message = await chrome.runtime.sendMessage(message)
    console.debug('relaying response from panel', responseMessage)
    window.postMessage(responseMessage, '*')
  }
})

// Relay events from the Eip1193Provider in the panel to the InjectedProvider in the tab
chrome.runtime.onMessage.addListener((message, sender) => {
  if (sender.id !== chrome.runtime.id) return

  if (message.type === INJECTED_PROVIDER_EVENT) {
    console.debug('relaying event from panel', message)
    window.postMessage(message, '*')
  }
})

export {}
