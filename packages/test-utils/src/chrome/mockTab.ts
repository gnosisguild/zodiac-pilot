import { invariant } from '@epic-web/invariant'
import { chromeMock } from './chromeMock'
import { createMockTab } from './creators'

type GetResultFn = (tab: chrome.tabs.Tab) => void

export const mockTab = (tabData: Partial<chrome.tabs.Tab> = {}) => {
  const tab = createMockTab(tabData)

  const currentGet = chromeMock.tabs.get.getMockImplementation()

  chromeMock.tabs.get.mockImplementation(
    (id: number, callback?: GetResultFn) => {
      if (id === tab.id) {
        if (typeof callback === 'function') {
          callback(tab)
        }

        return Promise.resolve(tab)
      }

      invariant(
        currentGet != null,
        'chrome.tabs.get has no implementation in this test',
      )

      return currentGet(id)
    },
  )

  return tab
}
