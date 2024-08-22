export const USER_WALLET_INITIALIZED = 'USER_WALLET_INITIALIZED'
export const USER_WALLET_REQUEST = 'USER_WALLET_REQUEST'
export const USER_WALLET_ERROR = 'USER_WALLET_ERROR'
export const USER_WALLET_RESPONSE = 'USER_WALLET_RESPONSE'
export const USER_WALLET_EVENT = 'USER_WALLET_EVENT'

interface UserWalletInitialized {
  type: typeof USER_WALLET_INITIALIZED
}

interface UserWalletRequest {
  type: typeof USER_WALLET_REQUEST
  requestId: string
  request: {
    method: string
    params: any[]
  }
}

interface UserWalletError {
  type: typeof USER_WALLET_ERROR
  requestId: string
  error: {
    message: string
    code: number
  }
}

interface UserWalletResponse {
  type: typeof USER_WALLET_RESPONSE
  requestId: string
  response: any
}

interface UserWalletEvent {
  type: typeof USER_WALLET_EVENT
  eventName: string
  eventData: any
}

export type Message =
  | UserWalletInitialized
  | UserWalletRequest
  | UserWalletError
  | UserWalletResponse
  | UserWalletEvent
