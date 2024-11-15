// this will be bundled in the panel app
import { ConnectedWalletMessage, ConnectedWalletMessageType } from '@/messages'
import { Eip1193Provider } from '@/types'
import { sleep } from '@/utils'
import { invariant } from '@epic-web/invariant'
import { EventEmitter } from 'events'
import { createPortOnTabActivity } from './port'

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

export class ConnectProvider extends EventEmitter implements Eip1193Provider {
  private port: chrome.runtime.Port | null = null

  private instanceId = instanceCounter++
  private messageCounter = 0

  private createNewPort: () => Promise<void>

  constructor(windowId: number) {
    super()

    const { promise, resolve } = Promise.withResolvers<() => Promise<void>>()

    this.createNewPort = async () => {
      const createNewPort = await promise

      return createNewPort()
    }

    createPortOnTabActivity(
      (tabId, port) => {
        if (port == null) {
          this.tearDownPort()
        } else {
          this.setupPort(port)

          const handleActivated = (info: chrome.tabs.TabActiveInfo) => {
            if (info.tabId !== tabId) {
              port.disconnect()
            }
          }

          // disconnect the current port when another tab
          // becomes active. this way we can ensure
          // that once a user comes back to this page
          // everything will be set up correctly again
          chrome.tabs.onActivated.addListener(handleActivated)

          port.onDisconnect.addListener(() =>
            chrome.tabs.onActivated.removeListener(handleActivated)
          )
        }
      },
      { windowId }
    ).then(resolve)
  }

  async setupPort(port: chrome.runtime.Port) {
    this.tearDownPort()

    console.debug('Connecting new port.')

    port.onMessage.addListener((message) => this.#handleEventMessage(message))

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

  async request(request: JsonRpcRequest): Promise<any> {
    const requestId = `${this.instanceId}:${this.messageCounter}`
    this.messageCounter++

    await this.waitForPort()

    const port = this.getPort()

    try {
      const responseMessage = await sendRequestToConnectIframe({
        port,
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
        console.debug('Attempted to use disconnected port. Recreating...')
        // the port was closed in the meantime, we reconnect and resend...

        this.tearDownPort()
        await this.createNewPort()

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

type SendRequestToConnectIFrameOptions = {
  port: chrome.runtime.Port
  requestId: string
  request: JsonRpcRequest
}

const sendRequestToConnectIframe = async ({
  port,
  request,
  requestId,
}: SendRequestToConnectIFrameOptions): Promise<ConnectedWalletMessage> => {
  const { promise, resolve } = Promise.withResolvers<ConnectedWalletMessage>()

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

  console.debug('Sending request to injected iframe', { request })

  port.postMessage({
    type: ConnectedWalletMessageType.CONNECTED_WALLET_REQUEST,
    requestId,
    request,
  })

  return promise
}
