// this will be bundled in the panel app
import { ConnectedWalletMessage, ConnectedWalletMessageType } from '@/messages'
import { Eip1193Provider } from '@/types'
import { getActiveTab } from '@/utils'
import { invariant } from '@epic-web/invariant'
import { EventEmitter } from 'events'

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

const tabInfo = new Map<number, string | undefined>()

export class ConnectProvider extends EventEmitter implements Eip1193Provider {
  private port: chrome.runtime.Port | null = null

  private instanceId = instanceCounter++
  private messageCounter = 0

  constructor() {
    super()

    chrome.tabs.onActivated.addListener(async ({ tabId }) => {
      const tab = await chrome.tabs.get(tabId)

      console.debug(`Tab (id: "${tabId}", url: "${tab.url}") became active.`)

      const port = await handleActiveTab(tab)

      if (port != null) {
        this.setupPort(tabId, port)
      } else {
        this.tearDownPort(tabId)
      }
    })

    chrome.tabs.onUpdated.addListener(async (tabId) => {
      const currentTab = await getActiveTab()

      if (currentTab.id !== tabId) {
        return
      }

      console.debug(
        `Tab (id: "${tabId}", url: "${currentTab.url}") has been updated.`
      )

      const url = tabInfo.get(tabId)

      if (url === currentTab.url) {
        if (isValidTab(url)) {
          console.debug(
            `Tab (id: "${tabId}", url: "${currentTab.url}") has no changes that require a new port.`
          )
        } else {
          console.debug(
            `Tab (id: "${tabId}", url: "${currentTab.url}") cannot be used.`
          )

          this.tearDownPort(tabId)
        }

        return
      }

      console.debug(
        `Tab (id: "${tabId}") updated URL from "${url}" to "${currentTab.url}".`
      )

      tabInfo.set(tabId, currentTab.url)

      const port = await handleActiveTab(currentTab)

      if (port != null) {
        this.setupPort(tabId, port)
      }
    })

    getActiveTab().then(async (tab) => {
      if (tab.id == null) {
        return
      }

      const port = await handleActiveTab(tab)

      if (port != null) {
        this.setupPort(tab.id, port)
      }
    })
  }

  async setupPort(tabId: number, port: chrome.runtime.Port) {
    this.tearDownPort(tabId)

    console.debug('Connecting new port.')

    port.onMessage.addListener((message) => this.#handleEventMessage(message))

    this.port = port

    this.emit('readyChanged', true)
  }

  tearDownPort(tabId: number) {
    tabInfo.delete(tabId)

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

  async request(request: JsonRpcRequest): Promise<any> {
    const requestId = `${this.instanceId}:${this.messageCounter}`
    this.messageCounter++

    await this.waitForPort()

    try {
      const responseMessage = await sendRequestToConnectIframe({
        port: this.getPort(),
        requestId,
        request,
      })

      if (
        responseMessage.type ===
        ConnectedWalletMessageType.CONNECTED_WALLET_RESPONSE
      ) {
        return responseMessage.response
      }

      if (
        responseMessage.type ===
        ConnectedWalletMessageType.CONNECTED_WALLET_ERROR
      ) {
        const error = new InjectedWalletError(
          responseMessage.error.message,
          responseMessage.error.code
        )

        throw error
      }

      console.error('Unexpected response', responseMessage)

      throw new Error('Unexpected response', { cause: responseMessage })
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

  #handleEventMessage(message: ConnectedWalletMessage) {
    if (message.type === ConnectedWalletMessageType.CONNECTED_WALLET_EVENT) {
      this.emit(message.eventName, message.eventData)
    }
  }
}

const isValidTab = (url: string | undefined) =>
  url != null && url !== '' && isValidProtocol(url)

const isValidProtocol = (url: string) =>
  ['chrome:', 'about:'].every((protocol) => !url.startsWith(protocol))

const createPort = (tabId: number, url: string | undefined) => {
  if (!isValidTab(url)) {
    console.debug(
      `Tab (id: "${tabId}", url: "${url}") does not meet connect criteria.`
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
    const handleInitMessage = (message: ConnectedWalletMessage) => {
      if (
        message.type !== ConnectedWalletMessageType.CONNECTED_WALLET_INITIALIZED
      ) {
        return
      }

      port.onDisconnect.removeListener(handleDisconnect)
      port.onMessage.removeListener(handleInitMessage)

      console.debug(`Tab (id: "${tabId}") port created.`)

      resolve(port)
    }

    port.onMessage.addListener(handleInitMessage)
  })
}

type SendRequestToConnectIFrameOptions = {
  port: chrome.runtime.Port
  requestId: string
  request: JsonRpcRequest
}

const sendRequestToConnectIframe = async ({
  port,
  request,
  requestId,
}: SendRequestToConnectIFrameOptions): Promise<ConnectedWalletMessage> =>
  new Promise((resolve) => {
    const handleResponse = (message: ConnectedWalletMessage) => {
      if (
        message.type !== ConnectedWalletMessageType.CONNECTED_WALLET_RESPONSE &&
        message.type !== ConnectedWalletMessageType.CONNECTED_WALLET_ERROR
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
      type: ConnectedWalletMessageType.CONNECTED_WALLET_REQUEST,
      requestId,
      request,
    })
  })

const handleActiveTab = async (tab: chrome.tabs.Tab) => {
  return new Promise<chrome.runtime.Port | null>((resolve) => {
    const handleTabWhenReady = async (
      tabId: number,
      info: chrome.tabs.TabChangeInfo
    ) => {
      const url = info.url || tabInfo.get(tabId)

      tabInfo.set(tabId, url)

      if (tab.id === tabId && info.status === 'complete') {
        console.debug(
          `Tab (id: "${tab.id}", url: "${url}") became ready. Trying to open port.`
        )

        const port = await createPort(tabId, url)

        if (port != null) {
          chrome.tabs.onUpdated.removeListener(handleTabWhenReady)

          console.debug(`Port to Tab (id: "${tab.id}", url: "${url}") created.`)

          resolve(port)
        }
      }
    }

    if (tab.id != null && tab.status === 'complete') {
      console.debug(
        `Tab (id: "${tab.id}", url: "${tab.url}") was already loaded. Trying to create port.`
      )

      createPort(tab.id, tab.url).then((port) => {
        if (port != null) {
          console.debug(
            `Port to Tab (id: "${tab.id}", url: "${tab.url}") created.`
          )

          resolve(port)
        } else {
          resolve(null)
        }
      })
    } else {
      console.debug(`Tab (id: "${tab.id}", url: "${tab.url}") NOT ready.`)

      chrome.tabs.onUpdated.addListener(handleTabWhenReady)
    }
  })
}

const sleep = (time: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, time))
