import { ConnectedWalletMessage, ConnectedWalletMessageType } from '@/messages'
import { isValidTab } from '@/utils'

export const createPort = async (tabId: number, url: string | undefined) => {
  if (!isValidTab(url)) {
    console.debug(
      `Tab (id: "${tabId}", url: "${url}") does not meet connect criteria.`
    )

    return Promise.resolve(null)
  }

  console.debug(`Connecting to Tab (id: "${tabId}")`)

  return connectToIframe(tabId)
}

const connectToIframe = async (tabId: number) => {
  const port = await connectToContentScript(tabId)

  const { promise, resolve } = Promise.withResolvers<chrome.runtime.Port>()

  const handleInitMessage = (message: ConnectedWalletMessage) => {
    if (
      message.type !== ConnectedWalletMessageType.CONNECTED_WALLET_INITIALIZED
    ) {
      return
    }

    port.onMessage.removeListener(handleInitMessage)

    console.debug(`Connected to injected iframe in Tab (id: "${tabId}").`)

    resolve(port)
  }

  port.onMessage.addListener(handleInitMessage)

  return promise
}

const connectToContentScript = (
  tabId: number
): Promise<chrome.runtime.Port> => {
  const { promise, resolve } = Promise.withResolvers<chrome.runtime.Port>()

  const port = chrome.tabs.connect(tabId)

  const timeout = setTimeout(() => {
    port.disconnect()

    resolve(connectToContentScript(tabId))
  }, 500)

  const handleConnect = (message: ConnectedWalletMessage) => {
    if (
      message.type !== ConnectedWalletMessageType.CONNECTED_WALLET_CONNECTED
    ) {
      return
    }

    clearTimeout(timeout)

    console.debug(`Connected to content script in tab (id: ${tabId}")`)

    port.onMessage.removeListener(handleConnect)

    resolve(port)
  }

  port.onMessage.addListener(handleConnect)

  return promise
}
