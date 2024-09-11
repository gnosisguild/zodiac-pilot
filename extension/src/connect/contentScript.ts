import {
  CONNECTED_WALLET_REQUEST,
  CONNECTED_WALLET_ERROR,
  CONNECTED_WALLET_RESPONSE,
  CONNECTED_WALLET_EVENT,
  Message,
  CONNECTED_WALLET_INITIALIZED,
} from './messages'

function injectIframe(src: string) {
  const node = document.createElement('iframe')
  node.src = src
  node.style.display = 'none'

  const parent = document.body || document.documentElement
  parent.append(node)

  return node.contentWindow
}

const alreadyInjected =
  document.documentElement.dataset.__zodiacPilotIframeInjected === 'true'

if (
  !alreadyInjected &&
  window.location.origin !== 'https://connect.pilot.gnosisguild.org' &&
  !window.location.href.startsWith('about:') &&
  !window.location.href.startsWith('chrome:')
) {
  // prevent duplicate injection
  document.documentElement.dataset.__zodiacPilotIframeInjected = 'true'

  // Render an invisible iframe to be able to connect with the injected provider from other wallet extensions
  const iframe = injectIframe('https://connect.pilot.gnosisguild.org/')

  // relay requests from the panel to the connect iframe
  chrome.runtime.onMessage.addListener((message: Message, sender, respond) => {
    // Since there might be multiple instances of this script running per page, we should not use the sendResponse callback.
    // Otherwise we might end up receiving the window response message in the wrong instance (not the one that the panel is waiting to receive the response from).
    if (sender.id !== chrome.runtime.id) return
    if (message.type === CONNECTED_WALLET_REQUEST) {
      if (!iframe) {
        throw new Error('cannot access connect iframe window')
      }

      // relay user wallet request to connect iframe so the connectInjection can receive it
      iframe.postMessage(message, 'https://connect.pilot.gnosisguild.org/') // TODO maybe use connect.pilot.gnosisguild.org instead of *?

      // wait for response
      const handleResponse = (event: MessageEvent<Message>) => {
        if (
          event.data.type !== CONNECTED_WALLET_RESPONSE &&
          event.data.type !== CONNECTED_WALLET_ERROR
        ) {
          return
        }
        if (event.data.requestId !== message.requestId) return

        event.stopImmediatePropagation()
        window.removeEventListener('message', handleResponse)
        chrome.runtime.sendMessage(event.data)
      }
      window.addEventListener('message', handleResponse)

      respond(true) // indicate that the request is being handled
    }
  })

  // relay wallet events from the connect iframe to the panel
  window.addEventListener('message', (event: MessageEvent<Message>) => {
    const message = event.data
    if (!message) return
    if (
      message.type === CONNECTED_WALLET_INITIALIZED ||
      message.type === CONNECTED_WALLET_EVENT
    ) {
      event.stopImmediatePropagation()
      chrome.runtime.sendMessage(message)
    }
  })
}

export {}
