import type { JsonRpcRequest } from '../JsonRpcRequest'

export enum InjectedProviderMessageTyp {
  INJECTED_PROVIDER_REQUEST = 'INJECTED_PROVIDER_REQUEST',
  INJECTED_PROVIDER_RESPONSE = 'INJECTED_PROVIDER_RESPONSE',
  INJECTED_PROVIDER_ERROR = 'INJECTED_PROVIDER_ERROR',
  INJECTED_PROVIDER_EVENT = 'INJECTED_PROVIDER_EVENT',
}

interface InjectedProviderRequest {
  type: InjectedProviderMessageTyp.INJECTED_PROVIDER_REQUEST
  requestId: string
  injectionId: string
  request: JsonRpcRequest
}

export interface InjectedProviderResponse {
  type: InjectedProviderMessageTyp.INJECTED_PROVIDER_RESPONSE
  requestId: string
  response: unknown
}

interface InjectedProviderError {
  type: InjectedProviderMessageTyp.INJECTED_PROVIDER_ERROR
  requestId: string
  error: {
    message: string
    code: number
  }
}

interface InjectedProviderEvent {
  type: InjectedProviderMessageTyp.INJECTED_PROVIDER_EVENT
  eventName: string
  eventData: unknown
}

export type InjectedProviderMessage =
  | InjectedProviderRequest
  | InjectedProviderResponse
  | InjectedProviderError
  | InjectedProviderEvent
