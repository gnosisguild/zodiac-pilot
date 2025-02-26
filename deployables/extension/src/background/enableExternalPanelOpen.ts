import { CompanionAppMessageType, createMessageHandler } from '@zodiac/messages'
import { resolve } from 'path'

export const enableExternalPanelOpen = () => {
  chrome.runtime.onMessage.addListener(
    createMessageHandler(
      CompanionAppMessageType.OPEN_PILOT,
      async (_, { tabId, windowId }) => {
        // This will open a tab-specific side panel only on the current tab.
        await chrome.sidePanel.open({
          tabId,
          windowId,
        })
        await chrome.sidePanel.setOptions({
          tabId,
          path: resolve(__dirname, '../../sidepanel.html'),
          enabled: true,
        })
      },
    ),
  )
}
