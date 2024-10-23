// this will be bundled in the panel app
import { toQuantity } from 'ethers'
import { ChainId } from 'ser-kit'
import { Eip1193Provider } from '../types'
import {
  INJECTED_PROVIDER_EVENT,
  INJECTED_PROVIDER_REQUEST,
  InjectedProviderMessage,
} from './messages'

let windowId: number | undefined

let provider: Eip1193Provider | undefined
let chainId: ChainId | undefined
let account: `0x${string}` | undefined

/** Set the window ID RPC events will only be relayed to tabs in this window */
export const setWindowId = (id: number) => {
  windowId = id
}

let resolveInitPromise: () => void
const initPromise = new Promise<void>((resolve) => {
  resolveInitPromise = resolve
})

/** Update the wallet */
export const update = (
  newProvider: Eip1193Provider,
  newChainId: ChainId,
  newAccount: `0x${string}`
) => {
  provider = newProvider

  if (newChainId !== chainId) {
    if (chainId === undefined) {
      emitEvent('connect', { chainId: toQuantity(newChainId) })
    } else {
      emitEvent('chainChanged', [toQuantity(newChainId)])
    }
  }
  chainId = newChainId

  if (newAccount !== account) {
    emitEvent('accountsChanged', [newAccount])
  }
  account = newAccount

  resolveInitPromise()
}

const emitEvent = async (eventName: string, eventData: any) => {
  const tabs = (
    await chrome.tabs.query({
      currentWindow: true,
    })
  ).filter((tab) => !!tab.id && !tab.url?.startsWith('chrome:'))

  for (const tab of tabs) {
    chrome.tabs.sendMessage(tab.id!, {
      type: INJECTED_PROVIDER_EVENT,
      eventName,
      eventData,
    } satisfies InjectedProviderMessage)
  }
}

// Relay RPC requests
chrome.runtime.onMessage.addListener(
  (message: InjectedProviderMessage, sender, sendResponse) => {
    // only handle messages from our extension
    if (sender.id !== chrome.runtime.id) return

    // only handle messages from the current window
    if (sender.tab?.windowId !== windowId) return

    if (message.type === INJECTED_PROVIDER_REQUEST) {
      initPromise
        .then(() => provider!.request(message.request))
        .then((response) => {
          sendResponse({
            type: 'INJECTED_PROVIDER_RESPONSE',
            requestId: message.requestId,
            response,
          } satisfies InjectedProviderMessage)
        })
        .catch((error) => {
          sendResponse({
            type: 'INJECTED_PROVIDER_ERROR',
            requestId: message.requestId,
            error: {
              message: error.message,
              code: error.code,
            },
          } satisfies InjectedProviderMessage)
        })

      // without this the response won't be sent
      return true
    }
  }
)
