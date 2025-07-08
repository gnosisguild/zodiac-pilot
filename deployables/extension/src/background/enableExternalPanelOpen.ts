import {
  CompanionAppMessageType,
  createTabMessageHandler,
} from '@zodiac/messages'
import { resolve } from 'path'

export const enableExternalPanelOpen = () => {
  chrome.runtime.onMessage.addListener(
    createTabMessageHandler(
      CompanionAppMessageType.OPEN_PILOT,
      async ({ search = '' }, { windowId }) => {
        // Open the side panel for the current window
        await chrome.sidePanel.open({
          windowId,
        })
        await chrome.sidePanel.setOptions({
          path: resolve('../../sidepanel.html') + search,
          enabled: true,
        })
      },
    ),
  )
}
