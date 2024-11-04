import { ChainId } from 'ser-kit'

export enum PilotMessageType {
  /**  sent when the panel is toggled */
  PILOT_PANEL_OPENED = 'PILOT_PANEL_OPENED',
  /** can be sent to open the panel from within an application */
  PILOT_OPEN_SIDEPANEL = 'PILOT_OPEN_SIDEPANEL',
  /** sent the first time a tab is activated after the panel has been opened */
  PILOT_CONNECT = 'PILOT_CONNECT',
  /** sent when the panel is closed */
  PILOT_DISCONNECT = 'PILOT_DISCONNECT',
}

interface PilotConnect {
  type: PilotMessageType.PILOT_CONNECT
}
interface PilotDisconnect {
  type: PilotMessageType.PILOT_DISCONNECT
}

interface PilotPanelOpened {
  type: PilotMessageType.PILOT_PANEL_OPENED
  windowId: number
  tabId?: number
}

export type Message = PilotConnect | PilotDisconnect | PilotPanelOpened

export enum RPCMessageType {
  PROBE_CHAIN_ID = 'PROBE_CHAIN_ID',
}

interface ProbeChainId {
  type: RPCMessageType.PROBE_CHAIN_ID
  url: string
}

export type RPCMessage = ProbeChainId

export enum PilotSimulationMessageType {
  SIMULATE_START = 'SIMULATE_START',
  SIMULATE_STOP = 'SIMULATE_STOP',
}

interface SimulateStart {
  type: PilotSimulationMessageType.SIMULATE_START
  windowId: number
  networkId: ChainId
  rpcUrl: string
}

interface SimulateStop {
  type: PilotSimulationMessageType.SIMULATE_STOP
  windowId: number
}

export type SimulationMessage = SimulateStart | SimulateStop

import { JsonRpcRequest } from '@/types'

export enum InjectedProviderMessageTyp {
  INJECTED_PROVIDER_REQUEST = 'INJECTED_PROVIDER_REQUEST',
  INJECTED_PROVIDER_RESPONSE = 'INJECTED_PROVIDER_RESPONSE',
  INJECTED_PROVIDER_ERROR = 'INJECTED_PROVIDER_ERROR',
  INJECTED_PROVIDER_EVENT = 'INJECTED_PROVIDER_EVENT',
}

interface InjectedProviderRequest {
  type: InjectedProviderMessageTyp.INJECTED_PROVIDER_REQUEST
  requestId: string
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

export enum ConnectedWalletMessageType {
  /**
   * sent to establish the connection between
   * connect/contentScript and the connect provider
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
