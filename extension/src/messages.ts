import { ChainId } from 'ser-kit'

export const PILOT_PANEL_OPENED = 'PILOT_PANEL_OPENED'
export const PILOT_PANEL_CLOSED = 'PILOT_PANEL_CLOSED'

export const PROBE_CHAIN_ID = 'PROBE_CHAIN_ID'

export const SIMULATE_START = 'SIMULATE_START'
export const SIMULATE_STOP = 'SIMULATE_STOP'

interface PilotPanelOpened {
  type: typeof PILOT_PANEL_OPENED
  windowId: number
  tabId?: number
}

interface PilotPanelClosed {
  type: typeof PILOT_PANEL_CLOSED
  windowId: number
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
  | PilotPanelOpened
  | PilotPanelClosed
  | ProbeChainId
  | SimulateStart
  | SimulateStop
