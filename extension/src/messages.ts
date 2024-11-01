import { ChainId } from 'ser-kit'

// we use a port to communicate between the panel app and the background script as this allows us to track when the panel is closed
export const PILOT_PANEL_PORT = 'PILOT_PANEL_PORT'

// triggered when the panel is toggled
export const PILOT_PANEL_OPENED = 'PILOT_PANEL_OPENED'
export const PILOT_OPEN_SIDEPANEL = 'PILOT_OPEN_SIDEPANEL'

// triggered the first time a tab is activated after the panel has been toggled
export const PILOT_CONNECT = 'PILOT_CONNECT'
export const PILOT_DISCONNECT = 'PILOT_DISCONNECT'

export const PROBE_CHAIN_ID = 'PROBE_CHAIN_ID'

export const SIMULATE_START = 'SIMULATE_START'
export const SIMULATE_STOP = 'SIMULATE_STOP'

interface PilotConnect {
  type: typeof PILOT_CONNECT
}
interface PilotDisconnect {
  type: typeof PILOT_DISCONNECT
}

interface PilotPanelOpened {
  type: typeof PILOT_PANEL_OPENED
  windowId: number
  tabId?: number
}

interface ProbeChainId {
  type: typeof PROBE_CHAIN_ID
  url: string
}

interface SimulateStart {
  type: typeof SIMULATE_START
  windowId: number
  networkId: ChainId
  rpcUrl: string
}

interface SimulateStop {
  type: typeof SIMULATE_STOP
  windowId: number
}

export type Message =
  | PilotConnect
  | PilotDisconnect
  | PilotPanelOpened
  | ProbeChainId
  | SimulateStart
  | SimulateStop
