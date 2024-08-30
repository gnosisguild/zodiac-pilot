import { setWindowId } from '../inject/bridge'
import { Message, PILOT_PANEL_OPENED, PILOT_PANEL_PORT } from '../messages'

// all communication with the background script goes through this central port
export const port = chrome.runtime.connect({ name: PILOT_PANEL_PORT })

// notify the background script that the panel has been opened
export const initPort = () => {
  chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
    if (tabs.length === 0) throw new Error('no active tab found')

    const windowId = tabs[0].windowId
    setWindowId(tabs[0].windowId)

    port.postMessage({
      type: PILOT_PANEL_OPENED,
      windowId: windowId,
      tabId: tabs[0].id,
    } satisfies Message)
  })
}
