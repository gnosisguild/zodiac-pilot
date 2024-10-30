import { REMOVE_CSP_RULE_ID } from './cspHeaderRule'
import { getRPCUrls } from './rpcTracking'
import { ForkedSession } from './types'

let currentRuleIds: number[] = []

export const removeAllRpcRedirectRules = async () => {
  await chrome.declarativeNetRequest.updateSessionRules({
    removeRuleIds: currentRuleIds,
  })
}

/**
 * Update the RPC redirect rules. This must be called for every update to activePilotSessions.
 */
export const updateRpcRedirectRules = async (sessions: ForkedSession[]) => {
  const addRules = sessions
    .flatMap(({ tabs, fork }) =>
      Array.from(tabs).map((tabId) => ({
        tabId,
        redirectUrl: fork.rpcUrl,
        regexFilter: makeUrlRegex(tabId, fork.networkId),
      }))
    )
    .filter(({ regexFilter }) => regexFilter != null)
    .map(({ tabId, redirectUrl, regexFilter }) => ({
      id: tabId,
      priority: 1,
      action: {
        type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
        redirect: { url: redirectUrl },
      },
      condition: {
        resourceTypes: [
          chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST,
        ],
        regexFilter: regexFilter!,
        tabIds: [tabId],
      },
    }))

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

/**
 * Concatenates all RPC urls for the given tab & network into a regular expression matching any of them.
 */
const makeUrlRegex = (tabId: number, networkId: number) => {
  const rpcUrls = getRPCUrls({ tabId, networkId })

  if (rpcUrls.length === 0) {
    return null
  }

  const regex = rpcUrls
    // Escape special characters
    .map((s) => s.replace(/[()[\]{}*+?^$|#.,/\\\s-]/g, '\\$&'))
    // Sort for maximal munch
    .sort((a, b) => b.length - a.length)
    .join('|')

  if (regex.length > 1500) {
    console.warn(
      'Regex longer than 1500 chars. Running in danger of exceeding 2kb rule size limit'
    )
  }

  return `^(${regex})$`
}

export const enableRPCDebugLogging = () => {
  // debug logging for RPC intercepts
  // This API is only available in unpacked mode!
  if (chrome.declarativeNetRequest.onRuleMatchedDebug == null) {
    return
  }

  chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((details) => {
    if (details.rule.ruleId !== REMOVE_CSP_RULE_ID) {
      console.debug(
        'rule matched on request',
        details.request.url,
        details.rule.ruleId
      )
    }
  })
}
