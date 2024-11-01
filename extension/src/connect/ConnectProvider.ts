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

  constructor() {
    super()

    createPortOnTabActivity((tabId, port) => {
      console.log('NEW PORT', { port })

      if (port == null) {
        this.tearDownPort()
      } else {
        this.setupPort(tabId, port)
      }
    })
  }

  async setupPort(tabId: number, port: chrome.runtime.Port) {
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
