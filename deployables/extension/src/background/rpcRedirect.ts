import { captureLastError } from '@/sentry'
import { createRedirectRule } from './createRedirectRule'
import { REMOVE_CSP_RULE_ID } from './cspHeaderRule'
import type { Fork } from './types'

export const removeAllRpcRedirectRules = async (forkUrl?: string) => {
  const { promise, resolve } = Promise.withResolvers<void>()

  chrome.declarativeNetRequest.getSessionRules((rules) => {
    const removeRuleIds = rules.reduce((result, rule) => {
      if (
        rule.action.type ===
        chrome.declarativeNetRequest.RuleActionType.REDIRECT
      ) {
        if (forkUrl != null) {
          if (rule.action.redirect?.url === forkUrl) {
            return [...result, rule.id]
          }

          return result
        }

        return [...result, rule.id]
      }

      return result
    }, [] as number[])

    chrome.declarativeNetRequest.updateSessionRules(
      {
        removeRuleIds,
      },
      () => {
        captureLastError()

        chrome.declarativeNetRequest.getSessionRules((rules) => {
          console.debug('RPC redirect rules updated', rules)

          resolve()
        })
      },
    )
  })

  return promise
}

/**
 * Update the RPC redirect rules. This must be called for every update to activePilotSessions.
 */
export const addRpcRedirectRules = async (
  { rpcUrl }: Fork,
  tabIdsByTrackedRPCUrls: Map<string, number[]>,
): Promise<void> => {
  console.debug(`Updating redirect rules `, { tabIdsByTrackedRPCUrls })

  const { promise, resolve } = Promise.withResolvers<void>()

  if (rpcUrl == null) {
    return resolve()
  }

  for (const [trackedRPCUrl, tabIds] of tabIdsByTrackedRPCUrls.entries()) {
    const { promise, resolve } = Promise.withResolvers<void>()

    const rule = await createRedirectRule({
      redirectUrl: rpcUrl,
      urlToMatch: trackedRPCUrl,
      tabIds,
    })

    chrome.declarativeNetRequest.updateSessionRules(
      {
        addRules: [rule],
      },
      () => {
        captureLastError()

        resolve()
      },
    )

    await promise
  }

  chrome.declarativeNetRequest.getSessionRules((rules) => {
    console.debug(
      'RPC redirect rules updated',
      rules.filter(
        (rule) =>
          rule.action.type ===
          chrome.declarativeNetRequest.RuleActionType.REDIRECT,
      ),
    )

    resolve()
  })

  return promise
}

export const enableRpcDebugLogging = () => {
  // debug logging for RPC intercepts
  // This API is only available in unpacked mode!
  if (chrome.declarativeNetRequest.onRuleMatchedDebug == null) {
    return
  }

  chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((details) => {
    if (details.rule.ruleId !== REMOVE_CSP_RULE_ID) {
      console.debug('rule matched on request', { details })
    }
  })
}
