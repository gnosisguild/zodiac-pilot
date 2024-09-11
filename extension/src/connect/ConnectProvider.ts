// this will be bundled in the panel app
import { EventEmitter } from 'events'
import { Eip1193Provider } from '../types'
import {
  Message,
  CONNECTED_WALLET_ERROR,
  CONNECTED_WALLET_EVENT,
  CONNECTED_WALLET_INITIALIZED,
  CONNECTED_WALLET_REQUEST,
  CONNECTED_WALLET_RESPONSE,
} from './messages'

interface JsonRpcRequest {
  method: string
  params?: Array<any>
}

class InjectedWalletError extends Error {
  code: number
  constructor(message: string, code: number) {
    super(message)
    this.code = code
  }
}

let instanceCounter = 0

export default class ConnectProvider
  extends EventEmitter
  implements Eip1193Provider
{
  private initialized = false
  private instanceId = instanceCounter++
  private messageCounter = 0

  private emittedEventIds = new Set<string>()

  constructor() {
    super()
    chrome.runtime.onMessage.addListener(this.#handleMessage)
  }

  isInitialized = (): boolean => {
    return this.initialized
  }

  request = async (request: JsonRpcRequest) => {
    const requestId = `${this.instanceId}:${this.messageCounter}`
    this.messageCounter++

    const responseMessage: Message = await this.#sendRequestToConnectIframe(
      requestId,
      request
    )

    if (responseMessage.type === CONNECTED_WALLET_RESPONSE) {
      return responseMessage.response
    } else if (responseMessage.type === CONNECTED_WALLET_ERROR) {
      const error = new InjectedWalletError(
        responseMessage.error.message,
        responseMessage.error.code
      )
      throw error
    } else {
      console.error('Unexpected response', responseMessage)
      throw new Error('Unexpected response')
    }
  }

  #sendRequestToConnectIframe = (
    requestId: string,
    request: JsonRpcRequest
  ): Promise<Message> => {
    return new Promise((resolve) => {
      chrome.tabs.query({ currentWindow: true }, async (tabs) => {
        const trackedTabs = tabs.filter(
          (tab) =>
            tab.id &&
            tab.url &&
            !tab.url.startsWith('chrome:') &&
            !tab.url.startsWith('about:')
        )

        for (const tab of trackedTabs) {
          try {
            const isBeingHandled = await chrome.tabs.sendMessage(tab.id!, {
              type: CONNECTED_WALLET_REQUEST,
              requestId,
              request,
            })
            if (!isBeingHandled) continue

            const handleResponse = (
              message: Message,
              sender: chrome.runtime.MessageSender
            ) => {
              if (sender.id !== chrome.runtime.id) return
              if (
                message.type !== CONNECTED_WALLET_RESPONSE &&
                message.type !== CONNECTED_WALLET_ERROR
              )
                return
              if (message.requestId !== requestId) return
              chrome.runtime.onMessage.removeListener(handleResponse)
              resolve(message)
            }
            chrome.runtime.onMessage.addListener(handleResponse)

            return
          } catch (error) {
            console.warn('Error sending message to tab', tab.id, error)
          }
        }
        // TODO open a new tab with https://connect.pilot.gnosisguild.org/ if no tracked tabs are found
        throw new Error('No tab with a connect iframe available')
      })
    })
  }

  #handleMessage = (message: Message, sender: chrome.runtime.MessageSender) => {
    if (sender.id !== chrome.runtime.id) return

    if (message.type === CONNECTED_WALLET_INITIALIZED) {
      this.initialized = true
    }
    if (message.type === CONNECTED_WALLET_EVENT) {
      this.#emitOnce(message.eventName, message.eventData)
    }
  }

  /** Wallet events will be relayed multiple times, once from each tab with a connect iframe. So we need to deduplicate. */
  #emitOnce = (eventName: string, eventData: any) => {
    const eventId = eventName + JSON.stringify(eventData)
    if (this.emittedEventIds.has(eventId)) return
    this.emittedEventIds.add(eventId)
    this.emit(eventName, eventData)
    window.setTimeout(() => {
      this.emittedEventIds.delete(eventId)
    }, 1)
  }
}
