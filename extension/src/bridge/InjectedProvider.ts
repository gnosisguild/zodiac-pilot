import { EventEmitter } from 'events'
import { nanoid } from 'nanoid'

interface JsonRpcRequest {
  method: string
  params?: Array<any>
}

interface JsonRpcResponse {
  method: string
  result?: unknown
  error?: Error
}

const injectionId = nanoid()

export default class InjectedProvider extends EventEmitter {
  private messageCounter = 0

  chainId = '0x1'

  // https://app.shinedao.finance/deals relies on this property
  selectedAddress: string | undefined = undefined

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

    this.request({ method: 'eth_chainId' }).then((chainId) => {
      this.chainId = chainId
      this.emit('connect', {
        chainId,
      })
    })

    // keep window.ethereum.selectedAddress in sync
    this.request({ method: 'eth_accounts' }).then((accounts) => {
      this.selectedAddress = accounts[0]
    })
    this.on('accountsChanged', (accounts) => {
      this.selectedAddress = accounts[0]
    })
  }

  request = (request: JsonRpcRequest): Promise<any> => {
    const currentMessageId = injectionId + this.messageCounter
    this.messageCounter++

    return new Promise((resolve, reject) => {
      (window.top || window).postMessage(
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
  send = async (
    method: string,
    params?: Array<any>
  ): Promise<JsonRpcResponse> => {
    try {
      const result = await this.request({ method, params })
      return { method, result }
    } catch (e) {
      return { method, error: e as Error }
    }
  }

  // Legacy API (still used by some Dapps)
  sendAsync = async (
    request: JsonRpcRequest,
    callback: (error: Error | undefined, response: JsonRpcResponse) => unknown
  ) => {
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
  enable = () => {
    return Promise.resolve()
  }

  // Some apps don't support generic injected providers, so we pretend to be MetaMask
  isMetaMask = true
}
