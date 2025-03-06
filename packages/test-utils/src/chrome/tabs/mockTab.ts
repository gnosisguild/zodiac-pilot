import { createMockTab } from '../creators'
import { upsertTab } from './tabStore'

export const mockTab = (tabData: Partial<chrome.tabs.Tab> = {}) => {
  const tab = createMockTab(tabData)

  upsertTab(tab)

  return tab
}
