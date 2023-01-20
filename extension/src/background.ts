// Attention: The URL must also be updated in manifest.json
const PILOT_URL = 'https://pilot.gnosisguild.org/'

// Track tabs showing our extension, so we can dynamically adjust the declarativeNetRequest rule.
// This rule removes some headers so foreign pages can be loaded in iframes. We don't want to
// generally circumvent this security mechanism, so we only apply it to extension tabs.
const activeExtensionTabs = new Set<number>()
const updateRule = () => {
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

interface Fork {
  networkId: number
  rpcUrl: string
}

// Track extension tabs that are actively simulating, meaning that RPC requests are being sent to
// a fork network.
// Map<tabId, Fork>
const simulatingExtensionTabs = new Map<number, Fork>()

chrome.runtime.onMessage.addListener((message, sender) => {
  if (!sender.tab?.id) return

  if (message.type === 'startSimulating') {
    const { networkId, rpcUrl } = message
    simulatingExtensionTabs.set(sender.tab.id, {
      networkId,
      rpcUrl,
    })
    console.debug(
      `start intercepting JSON RPC requests for network #${networkId} in tab #${sender.tab.id}`,
      rpcUrl
    )
  }
  if (message.type === 'stopSimulating') {
    simulatingExtensionTabs.delete(sender.tab.id)
    console.debug(
      `stop intercepting JSON RPC requests in tab #${sender.tab.id}`
    )
  }
})

// Keep track of the networks that RPCs are serving
const networkIdOfRpcUrl = new Map<string, number | undefined>()
const networkIdOfRpcUrlPromises = new Map<string, Promise<number | undefined>>()

const detectNetworkOfRpcUrl = async (url: string, tabId: number) => {
  if (!networkIdOfRpcUrlPromises.has(url)) {
    const promise = new Promise((resolve) => {
      // fetch from the injected script, so the request has the apps origin (otherwise the request may be blocked by the RPC provider)
      chrome.tabs.sendMessage(tabId, { type: 'requestChainId', url }, resolve)
    })

    networkIdOfRpcUrlPromises.set(url, promise as Promise<number | undefined>)
  }

  const result = await networkIdOfRpcUrlPromises.get(url)
  networkIdOfRpcUrl.set(url, result)
  console.debug(`detected network of JSON RPC endpoint ${url}: ${result}`)
}

const handleBeforeRequest = (
  details: chrome.webRequest.WebRequestBodyDetails
) => {
  // only intercept requests from extension tabs
  if (!activeExtensionTabs.has(details.tabId)) return
  // don't intercept requests from the extension itself
  if (details.parentFrameId === -1) return
  // only intercept POST requests
  if (details.method !== 'POST') return
  // only intercept requests with a JSON RPC body
  const jsonRpc = getJsonRpcBody(details)
  if (!jsonRpc) return

  // track the network IDs for all JSON RPC endpoints used from apps in the Pilot frame
  detectNetworkOfRpcUrl(details.url, details.tabId)

  // check if this RPC request should be redirected to a fork
  const fork = simulatingExtensionTabs.get(details.tabId)
  const networkId = networkIdOfRpcUrl.get(details.url)
  if (fork && networkId && fork.networkId === networkId) {
    console.debug(
      `Redirecting JSON RPC request from ${details.url} to fork ${fork.rpcUrl}`
    )
    return {
      redirectUrl: fork.rpcUrl,
    } satisfies chrome.webRequest.BlockingResponse
  }
}

const getJsonRpcBody = (details: chrome.webRequest.WebRequestBodyDetails) => {
  const bytes = details.requestBody?.raw?.[0]?.bytes
  if (!bytes) return undefined

  const bodyString = decodeURIComponent(
    String.fromCharCode.apply(null, [...new Uint8Array(bytes)])
  )

  let json
  try {
    json = JSON.parse(bodyString)
  } catch (e) {
    return undefined
  }

  if (!Array.isArray(json) || json.length === 0) {
    return undefined
  }

  if (json[0].jsonrpc !== '2.0') {
    return undefined
  }

  return json
}

chrome.webRequest.onBeforeRequest.addListener(
  handleBeforeRequest,
  {
    urls: ['<all_urls>'],
    types: ['xmlhttprequest'],
  },
  ['requestBody', 'blocking']
)

const startTrackingTab = (tabId: number) => {
  activeExtensionTabs.add(tabId)
  updateRule()
}

const stopTrackingTab = (tabId: number) => {
  activeExtensionTabs.delete(tabId)
  simulatingExtensionTabs.delete(tabId)
  updateRule()
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
