import { isValidTab } from './isValidTab'

export const sendTabMessage = async (tabId: number, message: unknown) => {
  const tab = await chrome.tabs.get(tabId)
  const { promise, resolve } = Promise.withResolvers()

  if (!isValidTab(tab.url)) {
    const handleActivate = async (activeInfo: chrome.tabs.TabActiveInfo) => {
      chrome.tabs.onActivated.removeListener(handleActivate)
      chrome.tabs.onUpdated.removeListener(handleUpdate)

      resolve(sendTabMessage(activeInfo.tabId, message))
    }

    chrome.tabs.onActivated.addListener(handleActivate)

    const handleUpdate = (
      updatedTabId: number,
      changeInfo: chrome.tabs.TabChangeInfo
    ) => {
      if (updatedTabId !== tabId) {
        return
      }

      if (changeInfo.url == null) {
        return
      }

      if (!isValidTab(changeInfo.url)) {
        return
      }

      chrome.tabs.onActivated.removeListener(handleActivate)
      chrome.tabs.onUpdated.removeListener(handleUpdate)

      resolve(sendTabMessage(tabId, message))
    }

    chrome.tabs.onUpdated.addListener(handleUpdate)

    return promise
  }

  if (tab.status === 'complete') {
    return chrome.tabs.sendMessage(tabId, message)
  }

  const handleUpdate = (
    updatedTabId: number,
    changeInfo: chrome.tabs.TabChangeInfo
  ) => {
    if (updatedTabId !== tabId) {
      return
    }

    if (changeInfo.status !== 'complete') {
      return
    }

    chrome.tabs.onUpdated.removeListener(handleUpdate)

    resolve(chrome.tabs.sendMessage(tabId, message))
  }

  chrome.tabs.onUpdated.addListener(handleUpdate)

  return promise
}
