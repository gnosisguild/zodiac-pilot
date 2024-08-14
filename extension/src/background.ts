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

const updateHeadersRule = () => {
  const RULE_ID = 1
  chrome.declarativeNetRequest.updateSessionRules(
    {
      addRules: [
        {
          id: RULE_ID,
          priority: 1,
          action: {
            // @ts-expect-error @types/chrome uses enums which we can't access
            type: 'modifyHeaders',
            responseHeaders: [
              // @ts-expect-error @types/chrome uses enums which we can't access
              { header: 'x-frame-options', operation: 'remove' },
              // @ts-expect-error @types/chrome uses enums which we can't access
              { header: 'X-Frame-Options', operation: 'remove' },
              // @ts-expect-error @types/chrome uses enums which we can't access
              { header: 'content-security-policy', operation: 'remove' },
              // @ts-expect-error @types/chrome uses enums which we can't access
              { header: 'Content-Security-Policy', operation: 'remove' },
            ],
          },
          condition: {
            // @ts-expect-error @types/chrome uses enums which we can't access
            resourceTypes: ['sub_frame'],
            tabIds: Array.from(activeExtensionTabs),
          },
        },
      ],
      removeRuleIds: [RULE_ID],
    },
    () => {
      if (chrome.runtime.lastError) {
        console.error('Rule update failed', chrome.runtime.lastError)
      } else {
        console.debug('Rule update successful', activeExtensionTabs)
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
  console.log({ activeExtensionTabs, openTabIds })

  // clear simulatingExtensionTabs that are not active (= extension is activated) anymore
  const simulatingTabIds = new Set(simulatingExtensionTabs.keys())
  simulatingTabIds.difference(activeExtensionTabs).forEach((tabId) => {
    simulatingExtensionTabs.delete(tabId)
  })

  // remove rules for tabs that are not simulating anymore
  const staleRules = await new Promise<chrome.declarativeNetRequest.Rule[]>(
    (resolve) => {
      chrome.declarativeNetRequest.getSessionRules((rules) => {
        resolve(
          rules.filter(
            (rule) =>
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
          id: hash(rpcUrl, tabId),
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
        }) as chrome.declarativeNetRequest.Rule
    )

  const ruleIds = [...networkIdOfRpcUrl.entries()].map(([rpcUrl]) =>
    hash(rpcUrl, tabId)
  )

  chrome.declarativeNetRequest.updateSessionRules({
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
  console.log(
    'removeRpcRedirectRules',
    tabId,
    ruleIds,
    hash(
      'https://virtual.mainnet.rpc.tenderly.co/880388c4-9707-46ce-97a5-1095090a6768',
      735219801
    )
  )
}

chrome.runtime.onMessage.addListener((message, sender) => {
  if (!sender.tab?.id) return

  if (message.type === 'startSimulating') {
    const { networkId, rpcUrl } = message
    console.log('startSimulating', networkId, rpcUrl, {
      simulatingExtensionTabs,
    })
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
    console.log('stopSimulating', sender.tab.id, { simulatingExtensionTabs })
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
