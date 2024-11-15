import { getActiveTab } from '@/utils'
import { createPortWhenTabIsReady } from './createPortWhenTabIsReady'

type PortCallbackFn = (tabId: number, port: chrome.runtime.Port | null) => void

type CreatePortOnTabActivityOptions = {
  windowId: number
}

export const createPortOnTabActivity = async (
  fn: PortCallbackFn,
  { windowId }: CreatePortOnTabActivityOptions
) => {
  chrome.tabs.onActivated.addListener(async (activeInfo) => {
    if (activeInfo.windowId !== windowId) {
      return
    }

    const tab = await chrome.tabs.get(activeInfo.tabId)

    console.debug(
      `Tab (id: "${activeInfo.tabId}", url: "${tab.url}") became active.`
    )

    const port = await createPortWhenTabIsReady(tab)

    fn(activeInfo.tabId, port)
  })

  chrome.tabs.onUpdated.addListener(async (tabId, info) => {
    const tab = await getActiveTab()

    if (tab.id !== tabId || tab.windowId !== windowId) {
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

  await createPortInActiveTab(fn)

  return async function createNewPort() {
    await createPortInActiveTab(fn)
  }
}

const createPortInActiveTab = async (fn: PortCallbackFn) => {
  const activeTab = await getActiveTab()

  if (activeTab.id == null) {
    return
  }

  const port = await createPortWhenTabIsReady(activeTab)

  fn(activeTab.id, port)
}
