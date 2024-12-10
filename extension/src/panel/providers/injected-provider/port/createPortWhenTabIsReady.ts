import { createPort } from './createPort'

export const createPortWhenTabIsReady = async (tab: chrome.tabs.Tab) => {
  if (tab.id == null) {
    return null
  }

  const { promise, resolve } =
    Promise.withResolvers<chrome.runtime.Port | null>()

  const tabId = tab.id

  if (tab.status !== 'complete') {
    console.debug(`Tab (id: "${tab.id}", url: "${tab.url}") NOT ready.`)

    const handleTabWhenReady = async (
      tabId: number,
      info: chrome.tabs.TabChangeInfo
    ) => {
      if (tab.id === tabId && info.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(handleTabWhenReady)

        console.debug(
          `Tab (id: "${tab.id}", url: "${tab.url}") became ready. Trying to open port.`
        )

        const port = await createPort(tabId, tab.url)

        if (port == null) {
          console.debug(`Could not create port to Tab (id: "${tab.id})`)
        } else {
          console.debug(
            `Port to Tab (id: "${tab.id}", url: "${tab.url}") created.`
          )
        }

        resolve(port)
      }
    }

    chrome.tabs.onUpdated.addListener(handleTabWhenReady)

    return promise
  }

  console.debug(
    `Tab (id: "${tab.id}", url: "${tab.url}") was already loaded. Trying to create port.`
  )

  const port = await createPort(tabId, tab.url)

  if (port == null) {
    return null
  }

  console.debug(`Port to Tab (id: "${tab.id}", url: "${tab.url}") created.`)

  return port
}
