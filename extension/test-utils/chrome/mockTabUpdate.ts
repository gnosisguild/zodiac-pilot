import { getActiveTab } from '@/utils'
import { callListeners } from './callListeners'
import { chromeMock } from './chromeMock'
import { mockActiveTab } from './mockActiveTab'

export const mockTabUpdate = async (chnageInfo: chrome.tabs.TabChangeInfo) => {
  const activeTab = await getActiveTab()

  const updatedTab = mockActiveTab({ ...activeTab, ...chnageInfo })

  await callListeners(
    chromeMock.tabs.onUpdated,
    updatedTab.id,
    chnageInfo,
    updatedTab,
  )
}
