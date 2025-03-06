import { createMockTab } from '../creators'
import { mockTab } from './mockTab'

export const mockActiveTab = (tab: Partial<chrome.tabs.Tab> = {}) => {
  const activeTab = createMockTab({ ...tab, active: true })

  return mockTab(activeTab)
}
