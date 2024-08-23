import { networkIdOfRpcUrl } from './rpcTracking'
import { REMOVE_CSP_RULE_ID } from './tabsTracking'
import { PilotSession } from './types'

// debug logging for RPC intercepts
chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((details) => {
  if (details.rule.ruleId !== REMOVE_CSP_RULE_ID) {
    console.debug(
      'rule matched on request',
      details.request.url,
      details.rule.ruleId
    )
  }
})

let currentRuleIds: number[] = []

/**
 * Update the RPC redirect rules. This must be called for every update to activePilotSessions.
 */
export const updateRpcRedirectRules = async (
  activePilotSessions: Map<number, PilotSession>
) => {
  const addRules = [...activePilotSessions.entries()]
    .filter(([, session]) => session.fork)
    .map(
      ([windowId, session]) =>
        ({
          id: windowId,
          priority: 1,
          action: {
            type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
            redirect: { url: session.fork!.rpcUrl },
          },
          condition: {
            resourceTypes: [
              chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST,
            ],
            urlRegex: makeUrlRegex(session.fork!.networkId),
            tabIds: Array.from(session.tabs),
          },
        }) as chrome.declarativeNetRequest.Rule
    )

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

/** Concatenates all RPC urls for the given network into a regular expression matching any of them */
const makeUrlRegex = (networkId: number) => {
  const rpcUrls = Array.from(networkIdOfRpcUrl.entries())
    .filter(([, id]) => id === networkId)
    .map(([url]) => url)

  return new RegExp(
    rpcUrls
      // Escape special characters
      .map((s) => s.replace(/[()[\]{}*+?^$|#.,/\\\s-]/g, '\\$&'))
      // Sort for maximal munch
      .sort((a, b) => b.length - a.length)
      .join('|')
  )
}
