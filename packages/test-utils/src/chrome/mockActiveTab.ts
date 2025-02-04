import { chromeMock } from './chromeMock'
import { createMockTab } from './creators'
import { mockTab } from './mockTab'

type ResultFn = (tabs: chrome.tabs.Tab[]) => void

export const mockActiveTab = (tab: Partial<chrome.tabs.Tab> = {}) => {
  const activeTab = createMockTab(tab)

  chromeMock.tabs.query.mockImplementation(
    (_: chrome.tabs.QueryInfo, callback?: ResultFn) => {
      if (typeof callback === 'function') {
        callback([activeTab])
      }

      return Promise.resolve([activeTab])
    },
  )

  return mockTab(activeTab)
}
