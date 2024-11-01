import { PilotMessageType } from '@/messages'
import { invariant } from '@epic-web/invariant'
import { resolve } from 'path'
import { trackRequests } from './rpcTracking'
import { trackSessions } from './sessionTracking'
import { trackSimulations } from './simulationTracking'

trackRequests()
trackSimulations()
trackSessions()

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error))

chrome.runtime.onMessageExternal.addListener(async (message, sender) => {
  // The callback for runtime.onMessage must return falsy if we're not sending a response

  if (message.type === PilotMessageType.PILOT_OPEN_SIDEPANEL) {
    invariant(sender.tab != null, 'Can not access sender tab information')

    // This will open a tab-specific side panel only on the current tab.
    await chrome.sidePanel.open({
      tabId: sender.tab.id,
      windowId: sender.tab.windowId,
    })
    await chrome.sidePanel.setOptions({
      tabId: sender.tab.id,
      path: resolve(__dirname, '../../sidepanel.html'),
      enabled: true,
    })
  }
})
