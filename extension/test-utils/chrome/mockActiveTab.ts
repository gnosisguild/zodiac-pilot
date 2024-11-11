import { vi } from 'vitest'
import { createMockTab } from '../creators'

type ResultFn = (tabs: chrome.tabs.Tab[]) => void

export const mockActiveTab = (tab: Partial<chrome.tabs.Tab> = {}) => {
  const mockQuery = vi.mocked(chrome.tabs.query)

  const activeTab = createMockTab(tab)

  mockQuery.mockImplementation(
    (_: chrome.tabs.QueryInfo, callback?: ResultFn) => {
      if (typeof callback === 'function') {
        callback([activeTab])
      }

      return Promise.resolve([activeTab])
    }
  )

  return activeTab
}