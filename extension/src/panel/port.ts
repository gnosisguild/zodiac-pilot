import { invariant } from '@epic-web/invariant'
import { setWindowId } from '../inject/bridge'
import { Message, PILOT_PANEL_OPENED, PILOT_PANEL_PORT } from '../messages'

// all communication with the background script goes through this central port
export const port = chrome.runtime.connect({ name: PILOT_PANEL_PORT })

// notify the background script that the panel has been opened
export const initPort = () => {
  chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
    const [activeTab] = tabs

    invariant(activeTab != null, 'no active tab found')

    const windowId = activeTab.windowId
    setWindowId(activeTab.windowId)

    port.postMessage({
      type: PILOT_PANEL_OPENED,
      windowId,
      tabId: activeTab.id,
    } satisfies Message)
  })
}
