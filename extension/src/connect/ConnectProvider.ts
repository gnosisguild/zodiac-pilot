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
import { invariant } from '@epic-web/invariant'

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
  private port: chrome.runtime.Port | null = null

  private instanceId = instanceCounter++
  private messageCounter = 0

  constructor() {
    super()

    chrome.tabs.onActivated.addListener(async (info) => {
      const tab = await chrome.tabs.get(info.tabId)

      console.debug(`Tab (id: "${tab.id}", url: "${tab.url}") became active.`)

      const port = await handleActiveTab(tab)

      if (port != null) {
        this.setupPort(port)
      } else {
        this.tearDownPort()
      }
    })

    chrome.tabs.getCurrent().then(async (tab) => {
      if (tab == null) {
        return
      }

      const port = await handleActiveTab(tab)

      if (port != null) {
        this.setupPort(port)
      }
    })
  }

  async setupPort(port: chrome.runtime.Port) {
    this.tearDownPort()

    port.onMessage.addListener(this.#handleEventMessage)

    this.port = port

    this.emit('readyChanged', true)
  }

  tearDownPort() {
    if (this.port == null) {
      return
    }

    console.debug('Disconnecting current port')

    this.port.disconnect()
    this.port = null

    this.emit('readyChanged', false)
  }

  waitForPort(maxWait: number = 1000, waited: number = 0) {
    const waitTime = 10

    if (waited > maxWait) {
      return Promise.reject(`Port did not open in time. Waited ${maxWait}ms.`)
    }

    return new Promise<void>((resolve) => {
      if (this.port != null) {
        resolve()
      } else {
        sleep(waitTime)
          .then(() => this.waitForPort(maxWait, waited + waitTime))
          .then(resolve)
      }
    })
  }

  getPort() {
    invariant(this.port != null, 'Port has not been initialized')

    return this.port
  }

  request = async (request: JsonRpcRequest): Promise<any> => {
    const requestId = `${this.instanceId}:${this.messageCounter}`
    this.messageCounter++

    await this.waitForPort()

    try {
      const responseMessage = await sendRequestToConnectIframe(
        this.getPort(),
        requestId,
        request
      )

      if (responseMessage.type === CONNECTED_WALLET_RESPONSE) {
        return responseMessage.response
      }

      if (responseMessage.type === CONNECTED_WALLET_ERROR) {
        const error = new InjectedWalletError(
          responseMessage.error.message,
          responseMessage.error.code
        )

        throw error
      }

      console.error('Unexpected response', responseMessage)
      throw new Error('Unexpected response')
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'Attempting to use a disconnected port object'
      ) {
        // the port was closed in the meantime, we reconnect and resend...

        return this.request(request)
      }

      throw error
    }
  }

  #handleEventMessage = (message: Message) => {
    if (message.type === CONNECTED_WALLET_EVENT) {
      this.emit(message.eventName, message.eventData)
    }
  }
}

type TabInfo = {
  status?: string
  url?: string
}

const isValidTab = (info: TabInfo) =>
  info.url != null && info.url !== '' && isValidProtocol(info.url)

const isValidProtocol = (url: string) =>
  ['chrome:', 'about:'].every((protocol) => !url.startsWith(protocol))

const openPort = (tabId: number, info: TabInfo) => {
  if (!isValidTab(info)) {
    console.debug(
      `Tab (id: "${tabId}", url: "${info.url}") does not meet connect criteria.`
    )

    return Promise.resolve(null)
  }

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

      console.debug(`Tab (id: "${tabId}") connected.`)

      resolve(port)
    }

    port.onMessage.addListener(handleInitMessage)
  })
}

const sendRequestToConnectIframe = async (
  port: chrome.runtime.Port,
  requestId: string,
  request: JsonRpcRequest
): Promise<Message> =>
  new Promise((resolve) => {
    const handleResponse = (message: Message) => {
      if (
        message.type !== CONNECTED_WALLET_RESPONSE &&
        message.type !== CONNECTED_WALLET_ERROR
      ) {
        return
      }

      if (message.requestId !== requestId) {
        return
      }

      port.onMessage.removeListener(handleResponse)

      resolve(message)
    }

    port.onMessage.addListener(handleResponse)

    port.postMessage({
      type: CONNECTED_WALLET_REQUEST,
      requestId,
      request,
    })
  })

const handleActiveTab = async (tab: chrome.tabs.Tab) =>
  new Promise<chrome.runtime.Port | null>((resolve) => {
    if (tab.id != null && tab.status === 'complete') {
      console.debug(
        `Tab (id: "${tab.id}", url: "${tab.url}") was already loaded. Opening port.`
      )

      resolve(openPort(tab.id, tab))
    } else {
      console.debug(`Tab (id: "${tab.id}", url: "${tab.url}") NOT ready.`)

      chrome.tabs.onUpdated.addListener(async (tabId, info) => {
        if (tab.id === tabId && info.status === 'complete') {
          console.debug(
            `Tab (id: "${tab.id}", url: "${tab.url}") became ready. Opening port.`
          )

          resolve(openPort(tabId, info))
        }
      })
    }
  })

const sleep = (time: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, time))
