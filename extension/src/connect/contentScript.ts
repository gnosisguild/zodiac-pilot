import {
  ConnectedWalletMessage,
  ConnectedWalletMessageType,
} from '@/pilot-messages'

function ensureIframe() {
  let node: HTMLIFrameElement | null = document.querySelector(
    'iframe[data__zodiacPilotConnectIframe]'
  )

  if (!node) {
    node = document.createElement('iframe')
    node.src = 'https://connect.pilot.gnosisguild.org/'
    node.style.display = 'none'
    node.dataset.__zodiacPilotConnectIframe === 'true'

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
    if (message.type === ConnectedWalletMessageType.CONNECTED_WALLET_REQUEST) {
      // relay user wallet request to connect iframe so the connectInjection can receive it
      if (!iframe.contentWindow) {
        throw new Error('cannot access connect iframe window')
      }
      iframe.contentWindow.postMessage(
        message,
        'https://connect.pilot.gnosisguild.org/'
      )

      // wait for response
      const handleResponse = (event: MessageEvent<ConnectedWalletMessage>) => {
        if (
          event.data.type !==
            ConnectedWalletMessageType.CONNECTED_WALLET_RESPONSE &&
          event.data.type !== ConnectedWalletMessageType.CONNECTED_WALLET_ERROR
        ) {
          return
        }
        if (event.data.requestId !== message.requestId) return

        event.stopImmediatePropagation()
        window.removeEventListener('message', handleResponse)
        port.postMessage(event.data)
      }
      window.addEventListener('message', handleResponse)
    }
  })

  // relay wallet events from the connect iframe to the panel
  const handleEvent = (event: MessageEvent<ConnectedWalletMessage>) => {
    const message = event.data
    if (!message) return
    if (
      message.type ===
        ConnectedWalletMessageType.CONNECTED_WALLET_INITIALIZED ||
      message.type === ConnectedWalletMessageType.CONNECTED_WALLET_EVENT
    ) {
      event.stopImmediatePropagation()
      port.postMessage(message)
    }
  }
  window.addEventListener('message', handleEvent)

  // clean up when the panel disconnects
  port.onDisconnect.addListener(async () => {
    window.removeEventListener('message', handleEvent)
    if (iframe) {
      iframe.remove()
    }
  })
})

export {}
