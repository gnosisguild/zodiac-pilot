import type { JsonRpcRequest } from '../JsonRpcRequest'

export enum ConnectedWalletMessageType {
  /**
   * sent to establish the connection between
   * connect/connectPilotToDApp and the connect provider
   */
  CONNECTED_WALLET_CONNECTED = 'CONNECTED_WALLET_CONNECTED',
  /**
   * sent to connect the injected wallet provider
   * and the connect provider
   */
  CONNECTED_WALLET_INITIALIZED = 'CONNECTED_WALLET_INITIALIZED',
  CONNECTED_WALLET_REQUEST = 'CONNECTED_WALLET_REQUEST',
  CONNECTED_WALLET_ERROR = 'CONNECTED_WALLET_ERROR',
  CONNECTED_WALLET_RESPONSE = 'CONNECTED_WALLET_RESPONSE',
  CONNECTED_WALLET_EVENT = 'CONNECTED_WALLET_EVENT',
}

type ScriptConnectionEstablished = {
  type: ConnectedWalletMessageType.CONNECTED_WALLET_CONNECTED
}

interface UserWalletInitialized {
  type: ConnectedWalletMessageType.CONNECTED_WALLET_INITIALIZED
}

interface UserWalletRequest {
  type: ConnectedWalletMessageType.CONNECTED_WALLET_REQUEST
  requestId: string
  request: JsonRpcRequest
}

interface UserWalletError {
  type: ConnectedWalletMessageType.CONNECTED_WALLET_ERROR
  requestId: string
  error: {
    message: string
    code: number
  }
}

interface UserWalletResponse {
  type: ConnectedWalletMessageType.CONNECTED_WALLET_RESPONSE
  requestId: string
  response: any
}

interface UserWalletEvent {
  type: ConnectedWalletMessageType.CONNECTED_WALLET_EVENT
  eventName: string
  eventData: any
}

export type ConnectedWalletMessage =
  | ScriptConnectionEstablished
  | UserWalletInitialized
  | UserWalletRequest
  | UserWalletError
  | UserWalletResponse
  | UserWalletEvent
