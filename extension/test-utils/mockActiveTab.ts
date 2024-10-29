import { vi } from 'vitest'

type ResultFn = (tabs: chrome.tabs.Tab[]) => void

export const mockActiveTab = (tab: Partial<chrome.tabs.Tab> = {}) => {
  const mockQuery = vi.mocked(chrome.tabs.query)

  mockQuery.mockImplementation(
    (_: chrome.tabs.QueryInfo, callback?: ResultFn) => {
      const activeTab = {
        active: true,
        autoDiscardable: true,
        discarded: false,
        groupId: 0,
        highlighted: false,
        incognito: false,
        index: 0,
        pinned: false,
        windowId: 0,
        selected: true,

        ...tab,
      } satisfies chrome.tabs.Tab

      if (typeof callback === 'function') {
        callback([activeTab])
      }

      return Promise.resolve([activeTab])
    }
  )
}
