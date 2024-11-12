import { isValidTab } from './isValidTab'

export const sendMessageToTab = async (tabId: number, message: unknown) => {
  const tab = await chrome.tabs.get(tabId)
  const { promise, resolve } = Promise.withResolvers()

  console.debug(`Trying to send message to tab "${tabId}"`, { message })

  if (!isValidTab(tab.url)) {
    console.debug(`Tab URL "${tab.url}" is not valid.`)

    const handleActivate = async (activeInfo: chrome.tabs.TabActiveInfo) => {
      chrome.tabs.onActivated.removeListener(handleActivate)
      chrome.tabs.onUpdated.removeListener(handleUpdate)

      resolve(sendMessageToTab(activeInfo.tabId, message))
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

      console.debug(`Tab "${tabId}" now has a valid URL "${changeInfo.url}".`)

      chrome.tabs.onActivated.removeListener(handleActivate)
      chrome.tabs.onUpdated.removeListener(handleUpdate)

      resolve(sendMessageToTab(tabId, message))
    }

    chrome.tabs.onUpdated.addListener(handleUpdate)

    return promise
  }

  if (tab.status === 'complete') {
    console.debug(`Sending message to tab "${tabId}".`, { message })

    const response = await chrome.tabs.sendMessage(tabId, message)

    console.debug(`Received response from tab`, { response })

    return response
  }

  console.debug(`Tab "${tabId}" is not ready. Waiting for page load.`)

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

    console.debug(`Tab "${tabId}" is now ready.`)

    resolve(sendMessageToTab(tabId, message))
  }

  chrome.tabs.onUpdated.addListener(handleUpdate)

  return promise
}
