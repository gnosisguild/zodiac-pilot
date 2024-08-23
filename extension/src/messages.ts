import { ChainId } from 'ser-kit'

export const PILOT_PANEL_OPENED = 'PILOT_PANEL_OPENED'
export const PROBE_CHAIN_ID = 'PROBE_CHAIN_ID'

export const SIMULATE_START = 'SIMULATE_START'
export const SIMULATE_STOP = 'SIMULATE_STOP'

interface PilotPanelOpened {
  type: typeof PILOT_PANEL_OPENED
  windowId: number
  tabId: number
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

export type Message = PilotPanelOpened | SimulateStart | SimulateStop
