import { invariant } from '@epic-web/invariant'
import type { Ref } from 'react'
import { beforeEach } from 'vitest'
import { chromeMock } from '../chromeMock'

const tabStore: Ref<Map<number, chrome.tabs.Tab>> = { current: new Map() }
const activeTab: Ref<number> = { current: null }

beforeEach(() => {
  activeTab.current = null

  if (tabStore.current == null) {
    return
  }

  tabStore.current.clear()
})

type GetResultFn = (tab: chrome.tabs.Tab) => void
type GetResultsFn = (tabs: chrome.tabs.Tab[]) => void

beforeEach(() => {
  chromeMock.tabs.get.mockImplementation(
    (tabId: number, callback?: GetResultFn) => {
      invariant(tabStore.current != null, 'Tab store not initialised')

      const tab = tabStore.current.get(tabId)

      invariant(tab != null, `Could not find a tab with id "${tabId}"`)

      if (typeof callback === 'function') {
        callback(tab)
      }

      return Promise.resolve(tab)
    },
  )

  chromeMock.tabs.query.mockImplementation(
    (queryInfo: chrome.tabs.QueryInfo, callback?: GetResultsFn) => {
      invariant(tabStore.current != null, 'Tab store not initialised')

      let tabs = Array.from(tabStore.current.values())

      if (queryInfo.active) {
        tabs = tabs.filter((tab) => tab.active)
      }

      if (typeof callback === 'function') {
        callback(tabs)
      }

      return Promise.resolve(tabs)
    },
  )
})

export const upsertTab = (tab: chrome.tabs.Tab) => {
  invariant(tab.id != null, 'Cannot add tab without id')
  invariant(tabStore.current != null, 'Tab store not initialised')

  if (tab.active) {
    if (activeTab.current != null) {
      const currentActiveTab = tabStore.current.get(activeTab.current)

      if (currentActiveTab != null) {
        tabStore.current.set(activeTab.current, {
          ...currentActiveTab,
          active: false,
        })
      }
    }

    activeTab.current = tab.id
  }

  tabStore.current.set(tab.id, tab)
}
