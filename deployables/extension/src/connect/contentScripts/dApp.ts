import { invariant } from '@epic-web/invariant'
import { getCompanionAppUrl } from '@zodiac/env'
import {
  ConnectedWalletMessageType,
  type ConnectedWalletMessage,
} from '@zodiac/messages'

const companionAppUrl = getCompanionAppUrl()

const ensureIframe = () => {
  let node: HTMLIFrameElement | null = document.querySelector(
    `iframe[src="${companionAppUrl}"]`,
  )

  if (!node) {
    node = document.createElement('iframe')
    node.src = companionAppUrl
    node.style.display = 'none'

    const parent = document.body || document.documentElement
    parent.append(node)
  }

  return node
}

// wait for connection from ConnectProvider (running in extension page), then inject iframe to establish a bridge to the user's injected wallet
chrome.runtime.onConnect.addListener((port) => {
  const iframe = ensureIframe()

  // relay requests from the panel to the connect iframe
  port.onMessage.addListener((message: ConnectedWalletMessage) => {
    if (message.type !== ConnectedWalletMessageType.CONNECTED_WALLET_REQUEST) {
      return
    }

    // relay user wallet request to connect iframe so the connectInjection can receive it
    invariant(
      iframe.contentWindow != null,
      'cannot access connect iframe window',
    )

    iframe.contentWindow.postMessage(message, companionAppUrl)

    // wait for response
    const handleResponse = (event: MessageEvent<ConnectedWalletMessage>) => {
      if (
        event.data.type !==
          ConnectedWalletMessageType.CONNECTED_WALLET_RESPONSE &&
        event.data.type !== ConnectedWalletMessageType.CONNECTED_WALLET_ERROR
      ) {
        return
      }
      if (event.data.requestId !== message.requestId) {
        return
      }

      event.stopImmediatePropagation()
      window.removeEventListener('message', handleResponse)
      port.postMessage(event.data)
    }

    window.addEventListener('message', handleResponse)
  })

  // relay wallet events from the connect iframe to the panel
  const handleEvent = (event: MessageEvent<ConnectedWalletMessage>) => {
    const message = event.data

    if (message == null) {
      return
    }

    if (message.type !== ConnectedWalletMessageType.CONNECTED_WALLET_EVENT) {
      return
    }

    console.debug('Event received from iframe', message.type)

    event.stopImmediatePropagation()
    port.postMessage(message)
  }

  window.addEventListener('message', handleEvent)

  const handleInit = (event: MessageEvent<ConnectedWalletMessage>) => {
    const message = event.data

    if (
      message == null ||
      message.type !== ConnectedWalletMessageType.CONNECTED_WALLET_INITIALIZED
    ) {
      return
    }

    console.debug('Init message received from iframe')

    window.removeEventListener('message', handleInit)

    event.stopImmediatePropagation()
    port.postMessage(message)
  }

  window.addEventListener('message', handleInit)

  // clean up when the panel disconnects
  port.onDisconnect.addListener(async () => {
    window.removeEventListener('message', handleEvent)
    window.removeEventListener('message', handleInit)

    if (iframe) {
      iframe.remove()
    }
  })

  port.postMessage({
    type: ConnectedWalletMessageType.CONNECTED_WALLET_CONNECTED,
  } satisfies ConnectedWalletMessage)
})

export {}
