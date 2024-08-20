import { networkIdOfRpcUrl } from './rpcTracking'
import { activeExtensionTabs, REMOVE_CSP_RULE_ID } from './tabsTracking'

// debug logging for rpc intercepts
chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((details) => {
  if (details.rule.ruleId !== REMOVE_CSP_RULE_ID) {
    console.debug(
      'rule matched on request',
      details.request.url,
      details.rule.ruleId
    )
  }
})

chrome.tabs.onActivated.addListener(({ tabId }) => {
  const enabled = activeExtensionTabs.has(tabId)
  chrome.sidePanel.setOptions({
    tabId,
    enabled,
  })
})

// Hash the RPC URL + tab ID to a number, so we can use it as a declarativeNetRequest rule ID.
// Implementation taken from https://github.com/darkskyapp/string-hash (CC0 Public Domain)
function hash(str: string) {
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

interface Fork {
  networkId: number
  rpcUrl: string
}

let currentRuleIds: number[] = []

/**
 * Updare the RPC redirect rules. This must be called whenever the active fork changes or when activeExtensionTabs changes.
 */
export const updateRpcRedirectRules = async (fork: Fork | null) => {
  const addRules = fork
    ? [...networkIdOfRpcUrl.entries()]
        .filter(([, networkId]) => networkId === fork.networkId)
        .map(
          ([rpcUrl]) =>
            ({
              id: hash(rpcUrl),
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
                tabIds: Array.from(activeExtensionTabs),
              },
            }) as chrome.declarativeNetRequest.Rule
        )
    : []

  const previousRuleIds = currentRuleIds
  currentRuleIds = addRules.map((rule) => rule.id)

  await chrome.declarativeNetRequest.updateSessionRules({
    addRules,
    removeRuleIds: previousRuleIds,
  })

  chrome.declarativeNetRequest.getSessionRules((rules) => {
    console.debug('RPC redirect rules updated', rules)
  })
}
