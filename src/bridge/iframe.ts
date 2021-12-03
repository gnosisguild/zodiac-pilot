import { EventEmitter } from 'events'

type Listener = (...args: any[]) => void

interface JsonRpcRequest {
  method: string
  params?: Array<any>
}

interface JsonRpcResponse {
  method: string
  result?: unknown
  error?: Error
}

export default class BridgeIframe extends EventEmitter {
  private messageId = 0

  private bridgedEvents: Set<string | symbol>

  constructor() {
    super()

    if (!window.top) throw new Error('Must run inside iframe')
    this.bridgedEvents = new Set()

    // If the host provider emits one of the bridged events, this will be posted as a message to the iframe window.
    // We pick up on these messages here and emit the event to our listeners.
    window.addEventListener('message', (ev) => {
      const { transactionPilotBridgeEventEmit, type, args } = ev.data
      if (transactionPilotBridgeEventEmit) {
        this.emit(type, ...args)
      }
    })

    window.top.postMessage(
      {
        transactionPilotBridgeInit: true,
      },
      '*'
    )
  }

  request(request: JsonRpcRequest): Promise<any> {
    const currentMessageId = this.messageId
    this.messageId++

    return new Promise((resolve, reject) => {
      if (!window.top) throw new Error('Must run inside iframe')
      window.top.postMessage(
        {
          transactionPilotBridgeRequest: true,
          request,
          messageId: currentMessageId,
        },
        '*'
      )

      const handleMessage = (ev: MessageEvent) => {
        const { transactionPilotBridgeResponse, messageId, error, response } =
          ev.data
        if (transactionPilotBridgeResponse && messageId === currentMessageId) {
          window.removeEventListener('message', handleMessage)
          console.log('RES', messageId, response)
          if (error) {
            reject(error)
          } else {
            resolve(response)
          }
        }
      }

      window.addEventListener('message', handleMessage)
    })
  }

  // Legacy API (still used by some Dapps)
  async send(method: string, params?: Array<any>): Promise<JsonRpcResponse> {
    try {
      const result = await this.request({ method, params })
      return { method, result }
    } catch (e) {
      return { method, error: new Error(e as string) }
    }
  }

  // Legacy API (still used by some Dapps)
  async sendAsync(
    request: JsonRpcRequest,
    callback: (error: Error | undefined, response: JsonRpcResponse) => unknown
  ) {
    try {
      const result = await this.request(request)
      callback(undefined, { method: request.method, result })
    } catch (e) {
      const error = new Error(e as string)
      callback(error, { method: request.method, error })
    }
  }

  // Wrap base implementation to subscribe to this event also from the host provider.
  on(type: string | symbol, listener: Listener): this {
    if (!window.top) throw new Error('Must run inside iframe')
    if (!this.bridgedEvents.has(type)) {
      window.top.postMessage(
        {
          transactionPilotBridgeEventListen: true,
          type,
        },
        '*'
      )
      this.bridgedEvents.add(type)
    }
    EventEmitter.prototype.on.call(this, type, listener)
    return this
  }
}
