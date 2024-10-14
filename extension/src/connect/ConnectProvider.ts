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
  private portPromise: Promise<chrome.runtime.Port>

  private initialized = false
  private instanceId = instanceCounter++
  private messageCounter = 0

  // private emittedEventIds = new Set<string>()

  constructor() {
    super()
    this.portPromise = this.#connect()
  }

  #connect = () => {
    return new Promise<chrome.runtime.Port>((resolve) => {
      chrome.tabs.onUpdated.addListener(async (tabId, info) => {
        if (info.status !== 'complete') {
          return
        }

        const tab = await chrome.tabs.get(tabId)

        if (tab.id !== tabId || !isValidTab(tab)) {
          return
        }

        try {
          const port = await this.#connectToTab(tabId)

          console.log('Connected to tab', tabId)

          port.onMessage.addListener(this.#handleEventMessage)

          port.onDisconnect.addListener(() => {
            this.initialized = false

            console.log(
              'Disconnected from connect iframe, reconnecting to a different tab...'
            )

            this.#connect()
          })

          resolve(port)
        } catch (error) {
          console.debug(`could not connect to tab #${tabId}`, error)
        }
      })
    })
  }

  #connectToTab = (tabId: number) => {
    return new Promise<chrome.runtime.Port>((resolve, reject) => {
      const port = chrome.tabs.connect(tabId, {
        name: 'connect',
      })

      // if the port connection cannot be established, this will trigger a disconnect event
      const handleDisconnect = () => {
        reject(new Error('No response from connect iframe'))
      }
      port.onDisconnect.addListener(handleDisconnect)

      // if we receive the CONNECTED_WALLET_INITIALIZED message, we resolve the promise to this port
      const handleInitMessage = (message: Message) => {
        if (message.type !== CONNECTED_WALLET_INITIALIZED) {
          return
        }

        port.onDisconnect.removeListener(handleDisconnect)
        port.onMessage.removeListener(handleInitMessage)

        resolve(port)
      }

      port.onMessage.addListener(handleInitMessage)
    })
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

  #sendRequestToConnectIframe = async (
    requestId: string,
    request: JsonRpcRequest
  ): Promise<Message> => {
    const port = await this.portPromise

    return new Promise((resolve) => {
      const handleResponse = (message: Message) => {
        if (
          message.type !== CONNECTED_WALLET_RESPONSE &&
          message.type !== CONNECTED_WALLET_ERROR
        ) {
          return
        }
        if (message.requestId !== requestId) return
        port.onMessage.removeListener(handleResponse)
        resolve(message)
      }
      port.onMessage.addListener(handleResponse)
      try {
        port.postMessage({
          type: CONNECTED_WALLET_REQUEST,
          requestId,
          request,
        })
      } catch (error: any) {
        if (error.message === 'Attempting to use a disconnected port object') {
          // the port was closed in the meantime, we reconnect and resend...
          this.portPromise = this.#connect()
          this.#sendRequestToConnectIframe(requestId, request)
        } else {
          console.error('Error sending message to connect iframe', error)
        }
      }
    })
  }

  #handleEventMessage = (message: Message) => {
    if (message.type === CONNECTED_WALLET_EVENT) {
      this.emit(message.eventName, message.eventData)
    }
  }
}

const isValidTab = (tab: chrome.tabs.Tab) =>
  tab.active &&
  tab.url &&
  !tab.url.startsWith('chrome:') &&
  !tab.url.startsWith('about:')
