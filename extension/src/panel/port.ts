import { Message, PilotMessageType } from '@/messages'
import { getActiveTab } from '@/utils'
import { invariant } from '@epic-web/invariant'
import { PILOT_PANEL_PORT } from '../const'
import { setWindowId } from '../inject/bridge'

// all communication with the background script goes through this central port
let port: chrome.runtime.Port | null = null

export const getPort = () => {
  if (port == null) {
    port = chrome.runtime.connect({ name: PILOT_PANEL_PORT })
  }

  invariant(port != null, 'Port not created')

  return port
}

// notify the background script that the panel has been opened
export const initPort = async () => {
  const activeTab = await getActiveTab()

  const windowId = activeTab.windowId
  setWindowId(activeTab.windowId)

  getPort().postMessage({
    type: PilotMessageType.PILOT_PANEL_OPENED,
    windowId,
    tabId: activeTab.id,
  } satisfies Message)
}
