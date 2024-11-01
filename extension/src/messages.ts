import { ChainId } from 'ser-kit'

// we use a port to communicate between the panel app and the background script as this allows us to track when the panel is closed
export const PILOT_PANEL_PORT = 'PILOT_PANEL_PORT'

export enum PilotMessageType {
  // triggered when the panel is toggled
  PILOT_PANEL_OPENED = 'PILOT_PANEL_OPENED',
  PILOT_OPEN_SIDEPANEL = 'PILOT_OPEN_SIDEPANEL',

  // triggered the first time a tab is activated after the panel has been toggled
  PILOT_CONNECT = 'PILOT_CONNECT',
  PILOT_DISCONNECT = 'PILOT_DISCONNECT',
}

export const PROBE_CHAIN_ID = 'PROBE_CHAIN_ID'

export enum PilotSimulationMessageType {
  SIMULATE_START = 'SIMULATE_START',
  SIMULATE_STOP = 'SIMULATE_STOP',
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

interface ProbeChainId {
  type: typeof PROBE_CHAIN_ID
  url: string
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

export type Message =
  | PilotConnect
  | PilotDisconnect
  | PilotPanelOpened
  | ProbeChainId
