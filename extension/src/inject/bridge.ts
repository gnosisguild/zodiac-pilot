import { ChainId } from 'ser-kit'
import { Eip1193Provider } from '../types'
import {
  INJECTED_PROVIDER_EVENT,
  INJECTED_PROVIDER_REQUEST,
  Message,
} from './messages'
import { ZeroAddress } from 'ethers'

let provider: Eip1193Provider | undefined
let chainId: ChainId = 1
let account = ZeroAddress as `0x${string}`

/** Update the wallet */
export const update = (
  newProvider: Eip1193Provider,
  newChainId: ChainId,
  newAccount: `0x${string}`
) => {
  provider = newProvider

  if (newChainId !== chainId) {
    emitEvent('chainChanged', [newChainId])
  }
  chainId = newChainId

  if (newAccount !== account) {
    emitEvent('accountsChanged', [newChainId])
  }
  account = newAccount
}

const emitEvent = (eventName: string, eventData: any) => {
  chrome.runtime.sendMessage({
    type: INJECTED_PROVIDER_EVENT,
    eventName,
    eventData,
  } satisfies Message)
}

// Relay RPC requests
chrome.runtime.onMessage.addListener(
  (message: Message, sender, sendResponse) => {
    // only handle messages from our extension
    if (sender.id !== chrome.runtime.id) return

    if (message.type === INJECTED_PROVIDER_REQUEST) {
      if (!provider) {
        throw new Error('Provider not yet initialized')
      }

      provider
        .request(message.request)
        .then((response) => {
          sendResponse({
            type: 'INJECTED_PROVIDER_RESPONSE',
            requestId: message.requestId,
            response,
          } satisfies Message)
        })
        .catch((error) => {
          sendResponse({
            type: 'INJECTED_PROVIDER_ERROR',
            requestId: message.requestId,
            error: {
              message: error.message,
              code: error.code,
            },
          } satisfies Message)
        })

      // without this the response won't be sent
      return true
    }
  }
)
