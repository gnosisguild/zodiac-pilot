import { Message, PILOT_PANEL_PORT, PilotMessageType } from '@/pilot-messages'
import { getActiveTab } from '@/utils'
import { setWindowId } from '../inject/bridge'

// all communication with the background script goes through this central port
export const port = chrome.runtime.connect({ name: PILOT_PANEL_PORT })

// notify the background script that the panel has been opened
export const initPort = async () => {
  const activeTab = await getActiveTab()

  const windowId = activeTab.windowId
  setWindowId(activeTab.windowId)

  port.postMessage({
    type: PilotMessageType.PILOT_PANEL_OPENED,
    windowId,
    tabId: activeTab.id,
  } satisfies Message)
}
