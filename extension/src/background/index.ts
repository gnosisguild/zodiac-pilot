import { invariant } from '@epic-web/invariant'
import { resolve } from 'path'
import { Message, PILOT_PANEL_OPENED, PILOT_PANEL_PORT } from '../messages'
import './sessionTracking'
import { startPilotSession, stopPilotSession } from './sessionTracking'
import './tabsTracking'

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

chrome.runtime.onMessage.addListener(async (message, sender) => {
  // The callback for runtime.onMessage must return falsy if we're not sending a response

  console.log({ message })
  if (message.type === 'open_side_panel') {
    invariant(sender.tab != null, 'Can not access sender tab information')

    // This will open a tab-specific side panel only on the current tab.
    await chrome.sidePanel.open({
      tabId: sender.tab.id,
      windowId: sender.tab.windowId,
    })
    await chrome.sidePanel.setOptions({
      tabId: sender.tab.id,
      path: resolve(__dirname, '../../sidepanel.html'),
      // path: 'src/pages/sidepanel/sidepanel.html', // replace with your sidepanel index
      enabled: true,
    })
  }
})

export {}
