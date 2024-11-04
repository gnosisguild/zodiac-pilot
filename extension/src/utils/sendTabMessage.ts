export const sendTabMessage = async (tabId: number, message: unknown) => {
  const tab = await chrome.tabs.get(tabId)

  if (tab.status === 'complete') {
    return chrome.tabs.sendMessage(tabId, message)
  }

  const { promise, resolve } = Promise.withResolvers()

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
