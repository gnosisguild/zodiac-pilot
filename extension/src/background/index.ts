import './tabsTracking'
import './sessionTracking'
import { Message, PILOT_PANEL_OPENED, PILOT_PANEL_PORT } from '../messages'
import { startPilotSession, stopPilotSession } from './sessionTracking'

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error))

// all messages from the panel app are received here
// (the port is opened from panel/port.ts)
chrome.runtime.onConnect.addListener(function (port) {
  let windowId: number
  if (port.name === PILOT_PANEL_PORT) {
    port.onMessage.addListener((message: Message) => {
      if (message.type === PILOT_PANEL_OPENED) {
        windowId = message.windowId
        console.log('Sidepanel opened.', windowId)
        startPilotSession(message.windowId, message.tabId)
        if (message.tabId) chrome.tabs.reload(message.tabId)
      }
    })

    port.onDisconnect.addListener(async () => {
      console.log('Sidepanel closed.', windowId)
      stopPilotSession(windowId)
      chrome.tabs.query({ windowId, active: true }, (tabs) => {
        const tabId = tabs[0]?.id
        if (tabId) chrome.tabs.reload(tabId)
      })
    })
  }
})

export {}
