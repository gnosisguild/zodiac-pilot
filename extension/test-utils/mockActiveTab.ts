import { vi } from 'vitest'
import { createMockTab } from './createMockTab'

type ResultFn = (tabs: chrome.tabs.Tab[]) => void

export const mockActiveTab = (tab: Partial<chrome.tabs.Tab> = {}) => {
  const mockQuery = vi.mocked(chrome.tabs.query)

  mockQuery.mockImplementation(
    (_: chrome.tabs.QueryInfo, callback?: ResultFn) => {
      const activeTab = createMockTab(tab)

      if (typeof callback === 'function') {
        callback([activeTab])
      }

      return Promise.resolve([activeTab])
    }
  )
}
