import { getActiveTab } from '@/utils'
import { createPortWhenTabIsReady } from './createPortWhenTabIsReady'

type PortCallbackFn = (tabId: number, port: chrome.runtime.Port | null) => void

export const createPortOnTabActivity = (fn: PortCallbackFn) => {
  chrome.tabs.onActivated.addListener(async ({ tabId }) => {
    const tab = await chrome.tabs.get(tabId)

    console.debug(`Tab (id: "${tabId}", url: "${tab.url}") became active.`)

    const port = await createPortWhenTabIsReady(tab)

    fn(tabId, port)
  })

  chrome.tabs.onUpdated.addListener(async (tabId, info) => {
    const tab = await getActiveTab()

    if (tab.id !== tabId) {
      return
    }

    console.debug(`Tab (id: "${tabId}", url: "${tab.url}") has been updated.`)

    if (info.url == null && info.status == null) {
      console.debug(
        `Tab (id: "${tabId}", url: "${tab.url}") has no changes that require a new port.`
      )

      return
    }

    console.debug(`Tab (id: "${tabId}") updated URL to "${tab.url}".`)

    const port = await createPortWhenTabIsReady(tab)

    fn(tabId, port)
  })

  getActiveTab().then(async (tab) => {
    if (tab.id == null) {
      return
    }

    const port = await createPortWhenTabIsReady(tab)

    fn(tab.id, port)
  })
}
