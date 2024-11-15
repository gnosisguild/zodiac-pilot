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

    console.debug('Removing current port from connect provider')

    this.port = null

    this.emit('readyChanged', false)
  }

  async waitForPort(
    maxWait: number = 1000,
    waited: number = 0
  ): Promise<chrome.runtime.Port> {
    const waitTime = 10

    invariant(
      waited <= maxWait,
      `Port did not open in time. Waited ${maxWait}ms.`
    )

    if (this.port == null) {
      await sleep(waitTime)

      return this.waitForPort(maxWait, waited + waitTime)
    }

    return this.port
  }

  async request(request: JsonRpcRequest): Promise<any> {
    const requestId = `${this.instanceId}:${this.messageCounter}`
    this.messageCounter++

    const port = await this.waitForPort()

    try {
      const responseMessage = await sendRequestToConnectIframe({
        port,
        requestId,
        request,
      })

      switch (responseMessage.type) {
        case ConnectedWalletMessageType.CONNECTED_WALLET_RESPONSE: {
          return responseMessage.response
        }

        case ConnectedWalletMessageType.CONNECTED_WALLET_ERROR: {
          throw new InjectedWalletError(
            responseMessage.error.message,
            responseMessage.error.code
          )
        }

        default: {
          console.error('Unexpected response', responseMessage)

          throw new Error('Unexpected response', { cause: responseMessage })
        }
      }
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
