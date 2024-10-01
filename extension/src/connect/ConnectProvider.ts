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
      chrome.tabs.query({ currentWindow: true }, async (tabs) => {
        const trackedTabs = tabs.filter(
          (tab) =>
            tab.id &&
            tab.url &&
            !tab.url.startsWith('chrome:') &&
            !tab.url.startsWith('about:')
        )
        // const activeTab = trackedTabs.find((tab) => tab.active)
        // const otherTabs = trackedTabs.filter((tab) => tab !== activeTab)
        // console.log({ trackedTabs, activeTab, otherTabs })

        // Sequentially try to connect to each tab that potentially has a connect iframe
        for (const tab of trackedTabs) {
          console.log(tab, { ...tab })
          try {
            const port = await this.#connectToTab(tab.id!)
            console.log('Connected to tab', tab.id)
            port.onMessage.addListener(this.#handleEventMessage)
            port.onDisconnect.addListener(() => {
              this.initialized = false
              console.log(
                'Disconnected from connect iframe, reconnecting to a different tab...'
              )
              this.#connect()
            })
            resolve(port)
            return
          } catch (error) {
            console.debug(
              `could not connect to tab #${tab.id}, trying next tab...`,
              error
            )
          }
        }

        if (trackedTabs.length === 0) {
          // There's no open tab with a connect iframe
          // TODO handle this by opening a new tab with a dummy page (could show some help text saying "at least one tab must be open")
          throw new Error('No tab with a connect iframe available')
        } else {
          // retry after timeout to wait on connect content script to be injected into currently reloading tabs
          window.setTimeout(() => {
            resolve(this.#connect())
          }, 100)
        }
      })
    })
  }

  #connectToTab = (tabId: number) => {
    return new Promise<chrome.runtime.Port>((resolve, reject) => {
      const potentialPort = chrome.tabs.connect(tabId, {
        name: 'connect',
      })

      // if the port connection cannot be established, this will trigger a disconnect event
      const handleDisconnect = () => {
        reject(new Error('No response from connect iframe'))
      }
      potentialPort.onDisconnect.addListener(handleDisconnect)

      // if we receive the CONNECTED_WALLET_INITIALIZED message, we resolve the promise to this port
      const handleInitMessage = (message: Message) => {
        if (message.type === CONNECTED_WALLET_INITIALIZED) {
          potentialPort.onDisconnect.removeListener(handleDisconnect)
          potentialPort.onMessage.removeListener(handleInitMessage)
          resolve(potentialPort)
        }
      }
      potentialPort.onMessage.addListener(handleInitMessage)
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
