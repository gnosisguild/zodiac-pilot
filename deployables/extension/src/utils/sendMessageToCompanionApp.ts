import { getCompanionAppUrl } from '@zodiac/env'
import type { CompanionResponseMessage } from '@zodiac/messages'
import { sendMessageToTab } from './sendMessageToTab'

export const sendMessageToCompanionApp = async (
  tabId: number,
  message: CompanionResponseMessage,
) => {
  const tab = await chrome.tabs.get(tabId)

  if (tab.url == null) {
    return
  }

  if (!tab.url.startsWith(getCompanionAppUrl())) {
    return
  }

  return sendMessageToTab(tabId, message)
}
