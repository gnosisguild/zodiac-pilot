export enum PilotMessageType {
  /**  sent when the panel is toggled */
  PILOT_PANEL_OPENED = 'PILOT_PANEL_OPENED',
  /** sent the first time a tab is activated after the panel has been opened */
  PILOT_CONNECT = 'PILOT_CONNECT',
  /** sent when the panel is closed */
  PILOT_DISCONNECT = 'PILOT_DISCONNECT',
  PILOT_KEEP_ALIVE = 'EXTENSION::KEEP_ALIVE',
}

type PilotConnect = {
  type: PilotMessageType.PILOT_CONNECT
}
type PilotDisconnect = {
  type: PilotMessageType.PILOT_DISCONNECT
}

type PilotPanelOpened = {
  type: PilotMessageType.PILOT_PANEL_OPENED
  windowId: number
  tabId?: number
}

type PilotKeepAlive = {
  type: PilotMessageType.PILOT_KEEP_ALIVE
}

export type Message =
  | PilotConnect
  | PilotDisconnect
  | PilotPanelOpened
  | PilotKeepAlive
