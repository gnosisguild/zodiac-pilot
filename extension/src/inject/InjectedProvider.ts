import { EventEmitter } from 'events'
import { nanoid } from 'nanoid'
import {
  INJECTED_PROVIDER_ERROR,
  INJECTED_PROVIDER_EVENT,
  INJECTED_PROVIDER_REQUEST,
  INJECTED_PROVIDER_RESPONSE,
  Message,
} from './messages'

interface JsonRpcRequest {
  method: string
  params?: Array<any>
}

interface JsonRpcResponse {
  method: string
  result?: unknown
  error?: Error
}

class InjectedWalletError extends Error {
  code: number
  constructor(message: string, code: number) {
    super(message)
    this.code = code
  }
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

    this.request({ method: 'eth_chainId' }).then((chainId) => {
      this.chainId = chainId
      this.emit('connect', {
        chainId,
      })
    })

    // relay wallet events
    const handleBridgeEvent = (ev: MessageEvent<Message>) => {
      const message = ev.data
      if (message.type !== INJECTED_PROVIDER_EVENT) {
        return
      }
      this.emit(message.eventName, message.eventData)
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
    const requestId = injectionId + this.messageCounter
    this.messageCounter++

    return new Promise((resolve, reject) => {
      ;(window.top || window).postMessage(
        {
          type: INJECTED_PROVIDER_REQUEST,
          requestId,
          request,
        } satisfies Message,
        '*'
      )

      // wait for response...
      const handleMessage = (ev: MessageEvent<Message>) => {
        const message = ev.data

        if (
          message.type === INJECTED_PROVIDER_RESPONSE &&
          message.requestId == requestId
        ) {
          window.removeEventListener('message', handleMessage)
          resolve(message.response)
        }

        if (
          message.type == INJECTED_PROVIDER_ERROR &&
          message.requestId == requestId
        ) {
          window.removeEventListener('message', handleMessage)
          reject(
            new InjectedWalletError(message.error.message, message.error.code)
          )
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