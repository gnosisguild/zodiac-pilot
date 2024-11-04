import { Message, PilotMessageType } from '@/messages'
import { getActiveTab, isValidTab } from '@/utils'
import { PILOT_PANEL_PORT } from '../const'
import { setWindowId } from '../inject/bridge'

// notify the background script that the panel has been opened
export const initPort = async () => {
  const activeTab = await getActiveTab()

  const windowId = activeTab.windowId
  setWindowId(activeTab.windowId)

  const { promise, resolve } = Promise.withResolvers()

  if (!isValidTab(activeTab.url)) {
    const handleActivate = () => {
      chrome.tabs.onActivated.removeListener(handleActivate)
      chrome.tabs.onUpdated.removeListener(handleUpdated)

      resolve(initPort())
    }

    chrome.tabs.onActivated.addListener(handleActivate)

    const handleUpdated = (
      updatedTabId: number,
      changeInfo: chrome.tabs.TabChangeInfo
    ) => {
      if (updatedTabId !== activeTab.id) {
        return
      }

      if (changeInfo.url == null) {
        return
      }

      if (!isValidTab(changeInfo.url)) {
        return
      }

      chrome.tabs.onUpdated.removeListener(handleUpdated)
      chrome.tabs.onActivated.removeListener(handleActivate)

      resolve(initPort())
    }

    chrome.tabs.onUpdated.addListener(handleUpdated)

    return promise
  }

  const connectPort = () => {
    const port = chrome.runtime.connect({ name: PILOT_PANEL_PORT })

    port.postMessage({
      type: PilotMessageType.PILOT_PANEL_OPENED,
      windowId,
      tabId: activeTab.id,
    } satisfies Message)
  }

  if (activeTab.status === 'loading') {
    const handleTabLoad = (
      tabId: number,
      changeInfo: chrome.tabs.TabChangeInfo
    ) => {
      if (tabId !== activeTab.id) {
        return
      }

      if (changeInfo.status !== 'complete') {
        return
      }

      chrome.tabs.onUpdated.removeListener(handleTabLoad)

      connectPort()
    }

    chrome.tabs.onUpdated.addListener(handleTabLoad)
  } else {
    connectPort()
  }
}
