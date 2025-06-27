import {
  type InjectedProviderMessage,
  InjectedProviderMessageTyp,
} from '@zodiac/messages'
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

class InjectedWalletError extends Error {
  code: number
  constructor(message: string, code: number) {
    super(message)
    this.code = code
  }
}

const injectionId = nanoid()

export class InjectedProvider extends EventEmitter {
  private messageCounter = 0

  chainId = '0x1'

  // https://app.shinedao.finance/deals relies on this property
  selectedAddress: string | undefined = undefined

  constructor() {
    super()

    // relay wallet events
    const handleBridgeEvent = (ev: MessageEvent<InjectedProviderMessage>) => {
      const message = ev.data
      if (!message) return

      if (message.type === InjectedProviderMessageTyp.INJECTED_PROVIDER_EVENT) {
        this.emit(message.eventName, message.eventData)
      }
    }
    window.addEventListener('message', handleBridgeEvent)

    this.on('connect', ({ chainId }) => {
      this.chainId = chainId
    })
    this.on('chainChanged', (chainId) => {
      this.chainId = chainId
    })
    this.on('accountsChanged', (accounts) => {
      this.selectedAddress = accounts[0]
    })
  }

  request = (request: JsonRpcRequest): Promise<any> => {
    const requestId = injectionId + '_' + this.messageCounter
    this.messageCounter++

    return new Promise((resolve, reject) => {
      console.debug('Relaying request to connected wallet', { request })
      ;(window.top || window).postMessage(
        {
          type: InjectedProviderMessageTyp.INJECTED_PROVIDER_REQUEST,
          requestId,
          injectionId,
          request,
        } satisfies InjectedProviderMessage,
        '*',
      )

      // wait for response...
      const handleMessage = (ev: MessageEvent<InjectedProviderMessage>) => {
        const message = ev.data
        if (!message) return

        if (
          message.type ===
            InjectedProviderMessageTyp.INJECTED_PROVIDER_RESPONSE &&
          message.requestId == requestId
        ) {
          console.debug('Received response from Pilot', message.response)
          window.removeEventListener('message', handleMessage)
          resolve(message.response)
        }

        if (
          message.type == InjectedProviderMessageTyp.INJECTED_PROVIDER_ERROR &&
          message.requestId == requestId
        ) {
          window.removeEventListener('message', handleMessage)
          reject(
            new InjectedWalletError(message.error.message, message.error.code),
          )
        }
      }
      window.addEventListener('message', handleMessage)
    })
  }

  // Legacy API (still used by some Dapps)
  send = async (
    method: string,
    params?: Array<any>,
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
    callback: (error: Error | undefined, response: JsonRpcResponse) => unknown,
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
