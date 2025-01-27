import { captureLastError } from '@/sentry'
import { REMOVE_CSP_RULE_ID } from './cspHeaderRule'
import type { Fork } from './types'

export const removeAllRpcRedirectRules = async (tabIds: number[]) => {
  const { promise, resolve } = Promise.withResolvers<void>()

  chrome.declarativeNetRequest.updateSessionRules(
    {
      removeRuleIds: tabIds,
    },
    () => {
      captureLastError()

      chrome.declarativeNetRequest.getSessionRules((rules) => {
        console.debug('RPC redirect rules updated', rules)

        resolve()
      })
    },
  )

  return promise
}

/**
 * Update the RPC redirect rules. This must be called for every update to activePilotSessions.
 */
export const addRpcRedirectRules = async (
  tabIds: number[],
  fork: Fork,
  trackedRPCUrlsByTabId: Map<number, string[]>,
) => {
  const addRules = tabIds
    .map((tabId) => ({
      tabId,
      redirectUrl: fork.rpcUrl,
      regexFilter: makeUrlRegex(trackedRPCUrlsByTabId.get(tabId) || []),
    }))
    .filter(
      ({ regexFilter, redirectUrl }) =>
        regexFilter != null && redirectUrl != null,
    )
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

  const { promise, resolve } = Promise.withResolvers()

  chrome.declarativeNetRequest.updateSessionRules(
    {
      addRules,
    },
    () => {
      captureLastError()

      chrome.declarativeNetRequest.getSessionRules((rules) => {
        console.debug('RPC redirect rules updated', rules)
      })

      resolve(new Set(addRules.map(({ id }) => id)))
    },
  )

  return promise
}

/**
 * Concatenates all RPC urls for the given tab & network into a regular expression matching any of them.
 */
const makeUrlRegex = (rpcUrls: string[]) => {
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
      'Regex longer than 1500 chars. Running in danger of exceeding 2kb rule size limit',
    )
  }

  return `^(${regex})$`
}

export const enableRpcDebugLogging = () => {
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
        details.rule.ruleId,
      )
    }
  })
}
