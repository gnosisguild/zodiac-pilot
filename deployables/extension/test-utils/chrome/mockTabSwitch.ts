import { sleepTillIdle } from '@zodiac/test-utils'
import { callListeners } from './callListeners'
import { chromeMock } from './chromeMock'
import { mockActiveTab } from './mockActiveTab'

export const mockTabSwitch = async (newTab: Partial<chrome.tabs.Tab>) => {
  const activeTab = mockActiveTab(newTab)

  await callListeners(chromeMock.tabs.onActivated, {
    tabId: activeTab.id,
    windowId: activeTab.windowId,
  })

  await sleepTillIdle()
}
