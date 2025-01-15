import { invariant } from '@epic-web/invariant'
import { chromeMock } from './chromeMock'
import { createMockTab } from './creators'

type ResultFn = (tabs: chrome.tabs.Tab[]) => void
type GetResultFn = (tab: chrome.tabs.Tab) => void

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

  const currentGet = chromeMock.tabs.get.getMockImplementation()

  chromeMock.tabs.get.mockImplementation(
    (id: number, callback?: GetResultFn) => {
      if (id === activeTab.id) {
        if (typeof callback === 'function') {
          callback(activeTab)
        }

        return Promise.resolve(activeTab)
      }

      invariant(
        currentGet != null,
        'chrome.tabs.get has no implementation in this test',
      )

      return currentGet(id)
    },
  )

  return activeTab
}
