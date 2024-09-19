// Attention: The URL must also be updated in manifest.json
const PILOT_URL = 'https://pilot.gnosisguild.org/'

interface Fork {
  networkId: number
  rpcUrl: string
}

chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((details) => {
  if (details.rule.ruleId !== HEADERS_RULE_ID) {
    console.debug(
      'rule matched on request',
      details.request.url,
      details.rule.ruleId
    )
  }
})

// Track tabs showing our extension, so we can dynamically adjust the declarativeNetRequest rule.
// This rule removes some headers so foreign pages can be loaded in iframes. We don't want to
// generally circumvent this security mechanism, so we only apply it to extension tabs.
const activeExtensionTabs = new Set<number>()

const startTrackingTab = (tabId: number) => {
  activeExtensionTabs.add(tabId)
  clearStaleRules()
  updateHeadersRule()
  console.log('Pilot: started tracking tab', tabId)
}

const stopTrackingTab = (tabId: number) => {
  removeRpcRedirectRules(tabId)
  activeExtensionTabs.delete(tabId)
  simulatingExtensionTabs.delete(tabId)
  clearStaleRules()
  updateHeadersRule()
  console.log('Pilot: stopped tracking tab', tabId)
}

const HEADERS_RULE_ID = 1

const updateHeadersRule = () => {
  // TODO removing the CSP headers alone is not enough as it does not handle apps setting CSPs via <meta http-equiv> tags in the HTML (such as Uniswap, for example)
  // see: https://github.com/w3c/webextensions/issues/169#issuecomment-1689812644
  // A potential solution could be a service worker rewriting the HTML content in the doc request to filter out these tags?
  chrome.declarativeNetRequest.updateSessionRules(
    {
      addRules: [
        {
          id: HEADERS_RULE_ID,
          priority: 1,
          action: {
            type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
            responseHeaders: [
              {
                header: 'x-frame-options',
                operation: chrome.declarativeNetRequest.HeaderOperation.REMOVE,
              },
              {
                header: 'X-Frame-Options',
                operation: chrome.declarativeNetRequest.HeaderOperation.REMOVE,
              },
              {
                header: 'content-security-policy',
                operation: chrome.declarativeNetRequest.HeaderOperation.REMOVE,
              },
              {
                header: 'Content-Security-Policy',
                operation: chrome.declarativeNetRequest.HeaderOperation.REMOVE,
              },
              {
                header: 'content-security-policy-report-only',
                operation: chrome.declarativeNetRequest.HeaderOperation.REMOVE,
              },
              {
                header: 'Content-Security-Policy-Report-Only',
                operation: chrome.declarativeNetRequest.HeaderOperation.REMOVE,
              },
            ],
          },
          condition: {
            resourceTypes: [
              chrome.declarativeNetRequest.ResourceType.SUB_FRAME,
            ],
            tabIds: Array.from(activeExtensionTabs),
          },
        },
      ],
      removeRuleIds: [HEADERS_RULE_ID],
    },
    () => {
      if (chrome.runtime.lastError) {
        console.error('Headers rule update failed', chrome.runtime.lastError)
      } else {
        console.debug('Headers rule update successful', activeExtensionTabs)
      }
    }
  )
}

// When clicking the extension button, load the current tab's page in the simulation browser
const toggle = async (tab: chrome.tabs.Tab) => {
  if (!tab.id || !tab.url) return

  if (!tab.url.startsWith(PILOT_URL)) {
    // add to tracked list
    startTrackingTab(tab.id)

    const url =
      tab.url.startsWith('chrome://') || tab.url.startsWith('about:')
        ? ''
        : tab.url
    chrome.tabs.update(tab.id, {
      url: `${PILOT_URL}#${encodeURIComponent(url)}`,
    })
  } else {
    // remove from tracked list
    stopTrackingTab(tab.id)

    const url = new URL(tab.url)
    const appUrl = decodeURIComponent(url.hash.slice(1))

    await chrome.tabs.update(tab.id, {
      url: appUrl,
    })
  }
}

chrome.action.onClicked.addListener(toggle)

// wake up the background script after chrome restarts
// this fixes an issue of the action onClicked listener not being triggered (see: https://stackoverflow.com/a/76344225)
chrome.runtime.onStartup.addListener(() => {
  console.debug(`Zodiac Pilot startup`)
})

// Track extension tabs that are actively simulating, meaning that RPC requests are being sent to
// a fork network.
const simulatingExtensionTabs = new Map<number, Fork>()

// Hash the RPC URL + tab ID to a number, so we can use it as a declarativeNetRequest rule ID.
// Implementation taken from https://github.com/darkskyapp/string-hash (CC0 Public Domain)
function hash(rpcUrl: string, tabId: number) {
  const str = `${tabId}:${rpcUrl}`
  const MAX_RULE_ID = 0xffffff // chrome throws an error if the rule ID is too large ("expected integer, got number")

  let hash = 5381,
    i = str.length

  while (i) {
    hash = (hash * 33) ^ str.charCodeAt(--i)
  }

  /* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
   * integers. Since we want the results to be always positive, convert the
   * signed int to an unsigned by doing an unsigned bitshift. */
  return (hash >>> 0) % MAX_RULE_ID
}

async function clearStaleRules() {
  const openTabIds = await new Promise<Set<number>>((resolve) => {
    chrome.tabs.query({}, (tabs) => {
      resolve(new Set(tabs.map((tab) => tab.id).filter(Boolean) as number[]))
    })
  })

  // clear activeExtensionTabs that are not open anymore
  activeExtensionTabs.difference(openTabIds).forEach((tabId) => {
    activeExtensionTabs.delete(tabId)
  })

  // clear simulatingExtensionTabs that are not active (= extension is activated) anymore
  const simulatingTabIds = new Set(simulatingExtensionTabs.keys())
  simulatingTabIds.difference(activeExtensionTabs).forEach((tabId) => {
    simulatingExtensionTabs.delete(tabId)
  })

  // remove redirect rules for tabs that are not simulating anymore
  const staleRules = await new Promise<chrome.declarativeNetRequest.Rule[]>(
    (resolve) => {
      chrome.declarativeNetRequest.getSessionRules((rules) => {
        resolve(
          rules.filter(
            (rule) =>
              rule.id !== HEADERS_RULE_ID &&
              rule.condition.tabIds?.length === 1 &&
              !simulatingExtensionTabs.has(rule.condition.tabIds[0])
          )
        )
      })
    }
  )
  chrome.declarativeNetRequest.updateSessionRules({
    removeRuleIds: staleRules.map((r) => r.id),
  })

  console.debug('Cleared stale rules', staleRules)
}

const updateRpcRedirectRules = async (tabId: number) => {
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
          id: hash(rpcUrl, tabId),
          priority: 1,
          action: {
            type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
            redirect: { url: fork.rpcUrl },
          },
          condition: {
            resourceTypes: [
              chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST,
            ],
            urlFilter: rpcUrl,
            tabIds: [tabId],
          },
        }) as chrome.declarativeNetRequest.Rule
    )

  const ruleIds = [...networkIdOfRpcUrl.entries()].map(([rpcUrl]) =>
    hash(rpcUrl, tabId)
  )

  await chrome.declarativeNetRequest.updateSessionRules({
    addRules,
    removeRuleIds: ruleIds,
  })

  chrome.declarativeNetRequest.getSessionRules((rules) => {
    console.debug('RPC redirect rules updated', tabId, rules)
  })
}

const removeRpcRedirectRules = (tabId: number) => {
  const networkIdOfRpcUrl = networkIdOfRpcUrlPerTab.get(tabId)
  if (!networkIdOfRpcUrl) return
  const ruleIds = [...networkIdOfRpcUrl.entries()].map(([rpcUrl]) =>
    hash(rpcUrl, tabId)
  )
  chrome.declarativeNetRequest.updateSessionRules({
    removeRuleIds: ruleIds,
  })
  console.log('removed all RPC redirect rules for tab', tabId, ruleIds)
}

chrome.runtime.onMessage.addListener((message, sender) => {
  if (!sender.tab?.id) return

  if (message.type === 'startSimulating') {
    const { networkId, rpcUrl } = message
    simulatingExtensionTabs.delete(sender.tab.id)
    removeRpcRedirectRules(sender.tab.id)
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
    // ignore requests to fork RPCs
    if (details.url.startsWith('https://virtual.mainnet.rpc.tenderly.co/'))
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
    const promise = new Promise<number | undefined>((resolve) => {
      // fetch from the injected script, so the request has the apps origin (otherwise the request may be blocked by the RPC provider)
      chrome.tabs.sendMessage(tabId, { type: 'requestChainId', url }, resolve)
    })

    networkIdOfRpcUrlPromise.set(url, promise)
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
