import { createPort } from './createPort'

export const createPortWhenTabIsReady = async (tab: chrome.tabs.Tab) => {
  if (tab.id == null) {
    return Promise.resolve(null)
  }

  const tabId = tab.id

  return new Promise<chrome.runtime.Port | null>((resolve) => {
    const handleTabWhenReady = async (
      tabId: number,
      info: chrome.tabs.TabChangeInfo
    ) => {
      const url = info.url

      if (tab.id === tabId && info.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(handleTabWhenReady)

        console.debug(
          `Tab (id: "${tab.id}", url: "${url}") became ready. Trying to open port.`
        )

        const port = await createPort(tabId, url)

        console.debug(`Port to Tab (id: "${tab.id}", url: "${url}") created.`)

        resolve(port)
      }
    }

    if (tab.status !== 'complete') {
      console.debug(`Tab (id: "${tab.id}", url: "${tab.url}") NOT ready.`)

      chrome.tabs.onUpdated.addListener(handleTabWhenReady)

      return
    }

    console.debug(
      `Tab (id: "${tab.id}", url: "${tab.url}") was already loaded. Trying to create port.`
    )

    createPort(tabId, tab.url).then((port) => {
      if (port != null) {
        console.debug(
          `Port to Tab (id: "${tab.id}", url: "${tab.url}") created.`
        )

        resolve(port)
      } else {
        resolve(null)
      }
    })
  })
}
