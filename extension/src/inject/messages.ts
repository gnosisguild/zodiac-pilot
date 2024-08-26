import { JsonRpcRequest } from '../types'

export const PILOT_CONNECT = 'PILOT_CONNECT'
export const PILOT_DISCONNECT = 'PILOT_DISCONNECT'

export const INJECTED_PROVIDER_REQUEST = 'INJECTED_PROVIDER_REQUEST'
export const INJECTED_PROVIDER_RESPONSE = 'INJECTED_PROVIDER_RESPONSE'
export const INJECTED_PROVIDER_ERROR = 'INJECTED_PROVIDER_ERROR'
export const INJECTED_PROVIDER_EVENT = 'INJECTED_PROVIDER_EVENT'

interface PilotConnect {
  type: typeof PILOT_CONNECT
}
interface PilotDisconnect {
  type: typeof PILOT_DISCONNECT
}

interface InjectedProviderRequest {
  type: typeof INJECTED_PROVIDER_REQUEST
  requestId: string
  request: JsonRpcRequest
}

export interface InjectedProviderResponse {
  type: typeof INJECTED_PROVIDER_RESPONSE
  requestId: string
  response: any
}

interface InjectedProviderError {
  type: typeof INJECTED_PROVIDER_ERROR
  requestId: string
  error: {
    message: string
    code: number
  }
}

interface InjectedProviderEvent {
  type: typeof INJECTED_PROVIDER_EVENT
  eventName: string
  eventData: any
}

export type Message =
  | PilotConnect
  | PilotDisconnect
  | InjectedProviderRequest
  | InjectedProviderResponse
  | InjectedProviderError
  | InjectedProviderEvent
