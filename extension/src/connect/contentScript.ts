import {
  USER_WALLET_REQUEST,
  USER_WALLET_ERROR,
  USER_WALLET_RESPONSE,
  USER_WALLET_EVENT,
  Message,
  USER_WALLET_INITIALIZED,
} from './messages'

function injectIframe(src: string) {
  const node = document.createElement('iframe')
  node.src = src
  node.style.display = 'none'

  if (document.documentElement.dataset.__zodiacPilotIframeInjected) {
    // another installation of the extension has already injected itself
    // (this can happen when when loading unpacked extensions)
    return
  }
  document.documentElement.dataset.__zodiacPilotIframeInjected = 'true'

  const parent = document.body || document.documentElement
  parent.append(node)

  return node.contentWindow
}

// Render an invisible iframe to be able to connect with the injected provider from other wallet extensions
const iframe = injectIframe('https://vnet-api.pilot.gnosisguild.org/') // TODO replace with https://connect.pilot.gnosisguild.org/, also needs to be updated in manifest content_scripts
console.debug('injected connect iframe')

// relay requests from the panel to the connect iframe
chrome.runtime.onMessage.addListener((message, sender, respond) => {
  if (sender.id !== chrome.runtime.id) return

  if (message.type === USER_WALLET_REQUEST) {
    if (!iframe) {
      throw new Error('cannot access connect iframe window')
    }

    // relay user wallet request to connect iframe so the connectInjection can receive it
    iframe.postMessage(message, '*') // TODO maybe use connect.pilot.gnosisguild.org instead of *?

    // wait for response
    const handleResponse = (event: MessageEvent<Message>) => {
      if (
        event.data.type !== USER_WALLET_RESPONSE &&
        event.data.type !== USER_WALLET_ERROR
      ) {
        return
      }
      if (event.data.requestId !== message.requestId) return

      window.removeEventListener('message', handleResponse)
      respond(event.data)
    }
    window.addEventListener('message', handleResponse)

    return true // without this the response won't be sent
  }
})

// relay wallet events from the connect iframe to the panel
window.addEventListener('message', (event: MessageEvent<Message>) => {
  const message = event.data
  if (!message) return
  if (
    message.type === USER_WALLET_INITIALIZED ||
    message.type === USER_WALLET_EVENT
  ) {
    chrome.runtime.sendMessage(message)
  }
})

export {}
