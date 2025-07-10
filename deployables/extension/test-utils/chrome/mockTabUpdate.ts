import { getActiveTab } from '@/utils'
import {
  callListeners,
  chromeMock,
  mockActiveTab,
} from '@zodiac/test-utils/chrome'

export const mockTabUpdate = async (chnageInfo: chrome.tabs.OnUpdatedInfo) => {
  const activeTab = await getActiveTab()

  const updatedTab = mockActiveTab({ ...activeTab, ...chnageInfo })

  await callListeners(
    chromeMock.tabs.onUpdated,
    updatedTab.id,
    chnageInfo,
    updatedTab,
  )
}
