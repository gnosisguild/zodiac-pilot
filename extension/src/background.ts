// Attention: The URL must also be updated in manifest.json
const PILOT_URL = 'https://pilot.gnosisguild.org/'

interface Fork {
  networkId: number
  rpcUrl: string
}

// Track tabs showing our extension, so we can dynamically adjust the declarativeNetRequest rule.
// This rule removes some headers so foreign pages can be loaded in iframes. We don't want to
// generally circumvent this security mechanism, so we only apply it to extension tabs.
const activeExtensionTabs = new Set<number>()
const updateHeadersRule = () => {
  const RULE_ID = 1
  chrome.declarativeNetRequest.updateSessionRules({
    addRules: [
      {
        id: RULE_ID,
        priority: 1,
        action: {
          // @ts-expect-error @types/chrome has not been updated for Chrome Extensions Manifest V3
          type: 'modifyHeaders',
          responseHeaders: [
            // @ts-expect-error @types/chrome has not been updated for Chrome Extensions Manifest V3
            { header: 'x-frame-options', operation: 'remove' },
            // @ts-expect-error @types/chrome has not been updated for Chrome Extensions Manifest V3
            { header: 'X-Frame-Options', operation: 'remove' },
            // @ts-expect-error @types/chrome has not been updated for Chrome Extensions Manifest V3
            { header: 'content-security-policy', operation: 'remove' },
            // @ts-expect-error @types/chrome has not been updated for Chrome Extensions Manifest V3
            { header: 'Content-Security-Policy', operation: 'remove' },
          ],
        },
        condition: {
          // @ts-expect-error @types/chrome has not been updated for Chrome Extensions Manifest V3
          resourceTypes: ['sub_frame'],
          tabIds: Array.from(activeExtensionTabs),
        },
      },
    ],
    removeRuleIds: [RULE_ID],
  })
}

// When clicking the extension button, load the current tab's page in the simulation browser
const toggle = async (tab: chrome.tabs.Tab) => {
  if (!tab.id || !tab.url) return

  if (!tab.url.startsWith(PILOT_URL)) {
    console.log('activate Zodiac Pilot')

    // add to tracked list
    activeExtensionTabs.add(tab.id)

    const url =
      tab.url.startsWith('chrome://') || tab.url.startsWith('about:')
        ? ''
        : tab.url
    chrome.tabs.update(tab.id, {
      url: `${PILOT_URL}#${encodeURIComponent(url)}`,
    })
  } else {
    console.log('deactivate Zodiac Pilot')

    // remove from tracked list
    activeExtensionTabs.delete(tab.id)

    const url = new URL(tab.url)
    const appUrl = decodeURIComponent(url.hash.slice(1))

    await chrome.tabs.update(tab.id, {
      url: appUrl,
    })
  }
}
chrome.action.onClicked.addListener(toggle)

// Track extension tabs that are actively simulating, meaning that RPC requests are being sent to
// a fork network.
const simulatingExtensionTabs = new Map<number, Fork>()

const hashCode = (str: string) => {
  let hash = 0,
    i,
    chr
  if (str.length === 0) return hash
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i)
    hash = (hash << 5) - hash + chr
    hash |= 0 // Convert to 32bit integer
  }
  return hash
}

const updateRpcRedirectRules = (tabId: number) => {
  const fork = simulatingExtensionTabs.get(tabId)
  if (!fork) {
    return
  }

  const networkIdOfRpcUrl = networkIdOfRpcUrlPerTab.get(tabId)
  if (!networkIdOfRpcUrl) return

  const addRules = [...networkIdOfRpcUrl.entries()]
    .filter(([, networkId]) => networkId === fork.networkId)
    .map(
      ([rpcUrl]) =>
        ({
          id: hashCode(`${tabId}:${rpcUrl}`),
          priority: 1,
          action: {
            type: 'redirect',
            redirect: { url: fork.rpcUrl },
          },
          condition: {
            resourceTypes: ['xmlhttprequest'],
            urlFilter: rpcUrl,
            tabIds: [tabId],
          },
        } as chrome.declarativeNetRequest.Rule)
    )

  const ruleIds = [...networkIdOfRpcUrl.entries()].map(([rpcUrl]) =>
    hashCode(`${tabId}:${rpcUrl}`)
  )

  chrome.declarativeNetRequest.updateSessionRules({
    addRules,
    removeRuleIds: ruleIds,
  })
}

const removeRpcRedirectRules = (tabId: number) => {
  const networkIdOfRpcUrl = networkIdOfRpcUrlPerTab.get(tabId)
  if (!networkIdOfRpcUrl) return
  const ruleIds = [...networkIdOfRpcUrl.entries()].map(([rpcUrl]) =>
    hashCode(`${tabId}:${rpcUrl}`)
  )
  chrome.declarativeNetRequest.updateSessionRules({
    removeRuleIds: ruleIds,
  })
}

chrome.runtime.onMessage.addListener((message, sender) => {
  if (!sender.tab?.id) return

  if (message.type === 'startSimulating') {
    const { networkId, rpcUrl } = message
    simulatingExtensionTabs.set(sender.tab.id, {
      networkId,
      rpcUrl,
    })
    updateRpcRedirectRules(sender.tab.id)

    console.debug(
      `start intercepting JSON RPC requests for network #${networkId} in tab #${sender.tab.id}`,
      rpcUrl
    )
  }
  if (message.type === 'stopSimulating') {
    simulatingExtensionTabs.delete(sender.tab.id)
    removeRpcRedirectRules(sender.tab.id)

    console.debug(
      `stop intercepting JSON RPC requests in tab #${sender.tab.id}`
    )
  }
})

// Keep track of the network IDs for all JSON RPC endpoints used from apps in the Pilot frame
const networkIdOfRpcUrlPerTab = new Map<
  number,
  Map<string, number | undefined>
>()
const networkIdOfRpcUrlPromisePerTab = new Map<
  number,
  Map<string, Promise<number | undefined>>
>()
chrome.webRequest.onBeforeRequest.addListener(
  (details: chrome.webRequest.WebRequestBodyDetails) => {
    // only consider requests from extension tabs
    if (!activeExtensionTabs.has(details.tabId)) return
    // don't consider requests from the extension itself
    if (details.parentFrameId === -1) return
    // only consider POST requests
    if (details.method !== 'POST') return
    // don't consider requests that are already redirected to the fork RPC
    if (details.url === simulatingExtensionTabs.get(details.tabId)?.rpcUrl)
      return
    // only consider requests with a JSON RPC body
    if (!getJsonRpcBody(details)) return

    detectNetworkOfRpcUrl(details.url, details.tabId)
  },
  {
    urls: ['<all_urls>'],
    types: ['xmlhttprequest'],
  },
  ['requestBody']
)

const detectNetworkOfRpcUrl = async (url: string, tabId: number) => {
  if (!networkIdOfRpcUrlPerTab.has(tabId))
    networkIdOfRpcUrlPerTab.set(tabId, new Map())
  if (!networkIdOfRpcUrlPromisePerTab.has(tabId))
    networkIdOfRpcUrlPromisePerTab.set(tabId, new Map())
  const networkIdOfRpcUrl = networkIdOfRpcUrlPerTab.get(tabId) as Map<
    string,
    number | undefined
  >
  const networkIdOfRpcUrlPromise = networkIdOfRpcUrlPromisePerTab.get(
    tabId
  ) as Map<string, Promise<number | undefined>>

  if (!networkIdOfRpcUrlPromise.has(url)) {
    const promise = new Promise((resolve) => {
      // fetch from the injected script, so the request has the apps origin (otherwise the request may be blocked by the RPC provider)
      chrome.tabs.sendMessage(tabId, { type: 'requestChainId', url }, resolve)
    })

    networkIdOfRpcUrlPromise.set(url, promise as Promise<number | undefined>)
  }

  const result = await networkIdOfRpcUrlPromise.get(url)
  if (!networkIdOfRpcUrl.has(url)) {
    networkIdOfRpcUrl.set(url, result)
    console.debug(
      `detected network of JSON RPC endpoint ${url} in tab #${tabId}: ${result}`
    )
  }
}

const decoder = new TextDecoder('utf-8')
const getJsonRpcBody = (details: chrome.webRequest.WebRequestBodyDetails) => {
  const bytes = details.requestBody?.raw?.[0]?.bytes
  if (!bytes) return undefined

  let json
  try {
    json = JSON.parse(decodeURIComponent(decoder.decode(bytes)))
  } catch (e) {
    return undefined
  }

  const probeRpc = Array.isArray(json) ? json[0] : json
  if (probeRpc && probeRpc.jsonrpc !== '2.0') {
    return undefined
  }

  return json
}

const startTrackingTab = (tabId: number) => {
  activeExtensionTabs.add(tabId)
  updateHeadersRule()
}

const stopTrackingTab = (tabId: number) => {
  removeRpcRedirectRules(tabId)
  activeExtensionTabs.delete(tabId)
  simulatingExtensionTabs.delete(tabId)
  updateHeadersRule()
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  const isExtensionTab = !!tab.url?.startsWith(PILOT_URL)
  const wasExtensionTab = activeExtensionTabs.has(tabId)

  if (isExtensionTab && !wasExtensionTab) {
    startTrackingTab(tabId)
  }
  if (!isExtensionTab && wasExtensionTab) {
    stopTrackingTab(tabId)
  }

  if (changeInfo.status === 'complete' && isExtensionTab) {
    chrome.tabs.sendMessage(tabId, { type: 'navigationDetected' })
  }
})

export {}
