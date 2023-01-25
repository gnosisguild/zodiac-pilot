import { EventEmitter } from 'events'

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

  // GC OmniBridge relies on this property
  chainId = '0x1'

  constructor() {
    super()
    if (!window.top) throw new Error('Must run inside iframe')

    window.top.postMessage(
      {
        zodiacPilotBridgeInit: true,
      },
      '*'
    )

    this.request({ method: 'eth_chainId' }).then((chainId) => {
      this.chainId = chainId
      this.emit('connect', {
        chainId,
      })
    })

    const handleBridgeEvent = (ev: MessageEvent) => {
      const { zodiacPilotBridgeEvent, event, args } = ev.data
      if (!zodiacPilotBridgeEvent) {
        return
      }
      this.emit(event, ...args)
    }

    window.addEventListener('message', handleBridgeEvent)
  }

  request(request: JsonRpcRequest): Promise<any> {
    const currentMessageId = this.messageId
    this.messageId++

    return new Promise((resolve, reject) => {
      if (!window.top) throw new Error('Must run inside iframe')
      window.top.postMessage(
        {
          zodiacPilotBridgeRequest: true,
          request,
          messageId: currentMessageId,
        },
        '*'
      )

      const handleMessage = (ev: MessageEvent) => {
        const { zodiacPilotBridgeResponse, messageId, error, response } =
          ev.data
        if (zodiacPilotBridgeResponse && messageId === currentMessageId) {
          window.removeEventListener('message', handleMessage)
          console.debug('RES', messageId, response)
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
      return { method, error: e as Error }
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
      const error = e as Error
      callback(error, { method: request.method, error })
    }
  }

  isZodiacPilot = true

  // This is required for connecting to Etherscan
  enable() {
    return Promise.resolve()
  }

  // Stakewise only supports MetaMask and Tally as injected providers, so we pretend to be MetaMask
  isMetaMask = window.location.hostname === 'app.stakewise.io'
}
