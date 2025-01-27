import { invariant } from '@epic-web/invariant'
import { CompanionAppMessageType } from '@zodiac/messages'
import { resolve } from 'path'

export const enableExternalPanelOpen = () => {
  chrome.runtime.onMessage.addListener(async (message, sender) => {
    // The callback for runtime.onMessage must return falsy if we're not sending a response

    if (message.type === CompanionAppMessageType.OPEN_PILOT) {
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
}
