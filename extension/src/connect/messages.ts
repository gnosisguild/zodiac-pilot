import { JsonRpcRequest } from '../types'

export const CONNECTED_WALLET_INITIALIZED = 'CONNECTED_WALLET_INITIALIZED'
export const CONNECTED_WALLET_REQUEST = 'CONNECTED_WALLET_REQUEST'
export const CONNECTED_WALLET_ERROR = 'CONNECTED_WALLET_ERROR'
export const CONNECTED_WALLET_RESPONSE = 'CONNECTED_WALLET_RESPONSE'
export const CONNECTED_WALLET_EVENT = 'CONNECTED_WALLET_EVENT'

interface UserWalletInitialized {
  type: typeof CONNECTED_WALLET_INITIALIZED
}

interface UserWalletRequest {
  type: typeof CONNECTED_WALLET_REQUEST
  requestId: string
  request: JsonRpcRequest
}

interface UserWalletError {
  type: typeof CONNECTED_WALLET_ERROR
  requestId: string
  error: {
    message: string
    code: number
  }
}

interface UserWalletResponse {
  type: typeof CONNECTED_WALLET_RESPONSE
  requestId: string
  response: any
}

interface UserWalletEvent {
  type: typeof CONNECTED_WALLET_EVENT
  eventName: string
  eventData: any
}

export type Message =
  | UserWalletInitialized
  | UserWalletRequest
  | UserWalletError
  | UserWalletResponse
  | UserWalletEvent
